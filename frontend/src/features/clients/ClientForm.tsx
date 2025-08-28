// Purpose: Reusable form for Create/Edit client

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const ClientSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email"),
  phone: z.string().optional(),
});
export type ClientFormValues = z.infer<typeof ClientSchema>;

export type ClientFormProps = {
  defaultValues?: Partial<ClientFormValues>;
  onSubmit: (values: ClientFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitLabel?: string;
};

export default function ClientForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: ClientFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ClientFormValues>({
    resolver: zodResolver(ClientSchema),
    defaultValues: { name: "", email: "", phone: "", ...defaultValues },
  });

  useEffect(() => {
    reset({
      name: defaultValues?.name || "",
      email: defaultValues?.email || "",
      phone: defaultValues?.phone || "",
    });
  }, [defaultValues, reset]);

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
          onClick={onCancel}
          className="border rounded px-3 py-2"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-black text-white rounded px-3 py-2"
        >
          {isSubmitting ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
