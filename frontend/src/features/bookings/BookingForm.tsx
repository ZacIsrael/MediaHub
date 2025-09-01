// Purpose: Reusable form for Create/Edit booking
// Tech used: React Hook Form for state/validation plumbing, Zod for schema validation.

// React effect (to reset form when defaultValues change)
import { useEffect } from "react";
// React Hook Form main API
import { useForm } from "react-hook-form";
// Zod: schema & runtime validation
import { z } from "zod";
// Bridge so React Hook Form can use Zod for validation
import { zodResolver } from "@hookform/resolvers/zod";

// Define the validation rules for a Booking (see booking.dto file in backend)
// - client_id: required, number
// - event_date: required, string (date)
// - event_type: required, string
// - price: required, number

// Turn Date -> "YYYY-MM-DDTHH:mm:ssZ" (strip milliseconds)
const toIsoSeconds = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z");

export const BookingSchema = z.object({
  // coerce converts the string into a number (i.e. in the form, the id
  // will come in as "1", coerce turns "1" into 1)
  client_id: z.coerce
    .number()
    .int()
    .positive("Client ID must be a positive integer"),

  // Accept user-friendly strings from inputs and transform to strict ISO seconds UTC
  // .preprocess() allows the raw value to be converted into the specified shape
  event_date: z.preprocess(
    (val) => {
      if (typeof val === "string" && val.trim().length > 0) {
        // Handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm" (from date/datetime-local)
        const d = new Date(val);
        if (!isNaN(d.getTime())) return toIsoSeconds(d);
      }
      return val;
    },
    // regex for how the date is processed in the backend (refer to booking.interface,
    // event_date is of SQL type TIMESTAMP in postgreSQL, i.e. 2025-09-16T14:00:00Z)
    z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
        "Event date must be ISO like 'YYYY-MM-DDTHH:mm:ssZ'"
      )
  ),

  event_type: z
    .string()
    .min(1, "Event type is required")
    // remove all leading and trailing white spaces
    .transform((s) => s.trim()),

  // coerce converts the string into a number (i.e. in the form, the user input
  // will come in as "42", coerce turns "42" into 42)
  price: z.coerce
    .number()
    // just in case a service is being done pro-bono lol
    .min(0, "Price must be at least 0")
    .refine(Number.isFinite, "Price must be a finite number"),
});

// Infer a TypeScript type directly from the Zod schema,
// so the form values stay in sync with validation.
export type BookingFormValues = z.infer<typeof BookingSchema>;

// Props for the reusable form component.
// - defaultValues: prefill (used for Edit)
// - onSubmit: parent handles create/update
// - onCancel: parent can close the modal
// - submitLabel: customize button label (“Create” / “Update” / “Save”)
export type BookingFormProps = {
  defaultValues?: Partial<BookingFormValues>;
  onSubmit: (values: BookingFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitLabel?: string;
};

// The form component is intentionally “dumb” regarding API details.
// It only cares about values and validation; the parent manages mutations.
export default function BookingForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: BookingFormProps) {
  // Initialize React Hook Form
  const {
    // wires inputs → form state
    register,
    // wraps submit handler with validation
    handleSubmit,
    // built-in state (validation errors, submission status)
    formState: { errors, isSubmitting },
    // imperatively set values (used when editing)
    reset,
  } = useForm<BookingFormValues>({
    resolver: zodResolver(BookingSchema), // use Zod schema for validation
    /**
     * NOTE: RHF inputs emit strings. Schema uses z.coerce.number(),
     * number fields can be safely seeded as "" (empty string) and they’ll coerce on submit.
     */
    defaultValues: {
      client_id: (defaultValues?.client_id as any) ?? ("" as any),
      event_date: defaultValues?.event_date ?? "",
      event_type: defaultValues?.event_type ?? "",
      price: (defaultValues?.price as any) ?? ("" as any),
    },
  });

  // Keep form fields in sync when editing a different row
  useEffect(() => {
    reset({
      client_id: (defaultValues?.client_id as any) ?? ("" as any),
      event_date: defaultValues?.event_date ?? "",
      event_type: defaultValues?.event_type ?? "",
      price: (defaultValues?.price as any) ?? ("" as any),
    });
  }, [defaultValues, reset]);

  return (
    <form
      // disable native browser validation UI
      noValidate
      onSubmit={handleSubmit((v) => onSubmit(v))}
      className="form-card"
    >
      {/* Client ID */}
      <div className="field">
        <label style={{ color: "white" }} className="label" htmlFor="client-id">
            Client ID
        </label>
        
        <input
          id="client-id"
          style={{ color: "#111827" }}
          type="number"
          min={0}
          className={`input ${errors.client_id ? "input--error" : ""}`}
          placeholder="e.g., 1"
          aria-invalid={!!errors.client_id}
          aria-describedby={errors.client_id ? "client-id-error" : undefined}
          {...register("client_id" as const)}
        />
        {errors.client_id && (
          <div id="client-id-error" className="error">
            {errors.client_id.message?.toString()}
          </div>
        )}
      </div>

      {/* Event Date */}
      <label className="grid gap-1">
        <span className="text-sm font-medium">Event Date & Time</span>
        {/* With datetime-local, the browser returns "YYYY-MM-DDTHH:mm" in local time.
            z.preprocess converts it to strict UTC ISO with seconds. */}
        <input
          type="datetime-local"
          className="border rounded px-3 py-2"
          placeholder="YYYY-MM-DDTHH:mm"
          {...register("event_date")}
        />
        {errors.event_date && (
          <span className="text-red-600 text-sm">
            {errors.event_date.message?.toString()}
          </span>
        )}
      </label>

      {/* Event Type */}
      <label className="grid gap-1">
        <span className="text-sm font-medium">Event Type</span>
        <input
          className="border rounded px-3 py-2"
          placeholder="e.g., Portrait Session"
          {...register("event_type")}
        />
        {errors.event_type && (
          <span className="text-red-600 text-sm">
            {errors.event_type.message?.toString()}
          </span>
        )}
      </label>

      {/* Price */}
      <label className="grid gap-1">
        <span className="text-sm font-medium">Price</span>
        <input
          type="number"
          step="0.01"
          className="border rounded px-3 py-2"
          placeholder="e.g., 200"
          {...register("price")}
        />
        {errors.price && (
          <span className="text-red-600 text-sm">
            {errors.price.message?.toString()}
          </span>
        )}
      </label>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2">
        <button
          type="button"
          // let parent close modal
          onClick={onCancel}
          className="border rounded px-3 py-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          // prevents double-submits
          disabled={isSubmitting}
          className="bg-black text-white rounded px-3 py-2"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
