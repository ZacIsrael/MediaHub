// Purpose: Reusable form for Create/Edit client
// Tech used: React Hook Form for state/validation plumbing, Zod for schema validation.

// React effect (to reset form when defaultValues change)
import { useEffect } from 'react';
// React Hook Form main API
import { useForm } from 'react-hook-form';
// Zod: schema & runtime validation
import { z } from 'zod';
// Bridge so React Hook Form can use Zod for validation
import { zodResolver } from '@hookform/resolvers/zod';

// Define the validation rules for a Client.
// - name: required, min length 2
// - email: must be a valid email
// - phone: optional
const ClientSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
});

// Infer a TypeScript type directly from the Zod schema,
// so your form values stay in sync with validation.
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
      ...defaultValues
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
    <form onSubmit={handleSubmit((v) => onSubmit(v))} className="grid gap-3">
      <label className="grid gap-1">
        <span className="text-sm font-medium">Name</span>
        <input
          className="border rounded px-3 py-2"
          placeholder="Client name"
          {...register("name")}
        />
        {errors.name && (
          <span className="text-red-600 text-sm">{errors.name.message}</span>
        )}
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Email</span>
        <input
          className="border rounded px-3 py-2"
          placeholder="name@email.com"
          {...register("email")}
        />
        {errors.email && (
          <span className="text-red-600 text-sm">{errors.email.message}</span>
        )}
      </label>

      <label className="grid gap-1">
        <span className="text-sm font-medium">Phone (optional)</span>
        <input
          className="border rounded px-3 py-2"
          placeholder="(xxx) xxx-xxxx"
          {...register("phone")}
        />
        {errors.phone && (
          <span className="text-red-600 text-sm">{errors.phone.message}</span>
        )}
      </label>

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
