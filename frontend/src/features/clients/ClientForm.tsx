// Purpose: Reusable form for Create/Edit client
// Tech used: React Hook Form for state/validation plumbing, Zod for schema validation.

// React effect (to reset form when defaultValues change)
import { useEffect } from "react";
// React Hook Form main API
import { useForm } from "react-hook-form";
// Zod: schema & runtime validation
import { z } from "zod";
// Bridge so React Hook Form can use Zod for validation
import { zodResolver } from "@hookform/resolvers/zod";

// Define the validation rules for a Client.
// - name: required, min length 2
// - email: must be a valid email
// - phone: optional
const ClientSchema = z.object({
  name: z.string().trim().min(2, "Name is too short"),
  email: z.string().trim().email("Invalid email"),
  phone: z.string().optional(),
});

// Infer a TypeScript type directly from the Zod schema,
// so the form values stay in sync with validation.
export type ClientFormValues = z.infer<typeof ClientSchema>;

// Props for the reusable form component.
// - defaultValues: prefill (used for Edit)
// - onSubmit: parent handles create/update
// - onCancel: parent can close the modal
// - submitLabel: customize button label (“Create” / “Update” / “Save”)
export type ClientFormProps = {
  defaultValues?: Partial<ClientFormValues>;
  onSubmit: (values: ClientFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitLabel?: string;
};

// The form component is intentionally “dumb” regarding API details.
// It only cares about values and validation; the parent manages mutations.
export default function ClientForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: ClientFormProps) {
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
  } = useForm<ClientFormValues>({
    // use Zod schema for validation
    resolver: zodResolver(ClientSchema),
    // initial values (safe defaults + optional overrides)
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      ...defaultValues,
    },
  });

  // When defaultValues prop changes (e.g., user clicks “Edit” on a different row),
  // sync the form fields. This keeps the modal in sync without remounting.
  useEffect(() => {
    reset({
      name: defaultValues?.name || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
    });
  }, [defaultValues, reset]);

  // Basic, accessible form layout with inline error messages.
  return (
    <form
      // disable native browser validation UI
      noValidate
      onSubmit={handleSubmit((v) => onSubmit(v))}
      className="grid gap-3"
    >
      {/* Name */}

      <div className="field">
        <label
          style={{ color: "white" }}
          className="label"
          htmlFor="client-name"
        >
          Name
        </label>
        <input
          id="client-name"
          style={{ color: "#111827" }}
          className={`input ${errors.name ? "input--error" : ""}`}
          placeholder="Enter your first & last name here"
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "client-title-error" : undefined}
          {...register("name")}
        />
        {errors.name && (
          <div id="video-title-error" className="error">
            {errors.name.message?.toString()}
          </div>
        )}
      </div>

      {/* Email */}
      <div className="field">
        <label
          style={{ color: "white" }}
          className="label"
          htmlFor="client-email"
        >
          Email
        </label>
        <input
          id="client-email"
          style={{ color: "#111827" }}
          className={`input ${errors.email ? "input--error" : ""}`}
          placeholder="e.g., john.doe@email.com"
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? "client-email-error" : undefined}
          {...register("email")}
        />
        {errors.email && (
          <div id="client-email-error" className="error">
            {errors.email.message?.toString()}
          </div>
        )}
      </div>

      {/* Phone */}
      <div className="field">
        <label
          style={{ color: "white" }}
          className="label"
          htmlFor="client-phone"
        >
          Phone (optional)
        </label>
        <input
          id="client-phone"
          style={{ color: "#111827" }}
          className={`input ${errors.phone ? "input--error" : ""}`}
          placeholder="Enter your 10 digit phone # here (no spaces or dashes)"
          aria-invalid={!!errors.phone}
          aria-describedby={errors.phone ? "client-phone-error" : undefined}
          {...register("phone")}
        />
        {errors.phone && (
          <div id="client-phone-error" className="error">
            {errors.phone.message?.toString()}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 pt-2">
        <button
          type="button"
          // let parent close modal
          onClick={onCancel}
          // Visible on white modal; clear affordance
          className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          // prevents double-submits
          disabled={isSubmitting}
          // High-contrast primary
          className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
