// Purpose: Reusable form for Create/Edit social post
// Tech used: React Hook Form for state/validation plumbing, Zod for schema validation.

// React effect (to reset form when defaultValues change)
import { useEffect } from "react";
// React Hook Form main API
import { useForm } from "react-hook-form";
// Zod: schema & runtime validation
import { z } from "zod";
// Bridge so React Hook Form can use Zod for validation
import { zodResolver } from "@hookform/resolvers/zod";

// Define validation rules for a video (see socialposts.dto file in backend)
// - platform: required, string;
// - url: required, string;
// - caption: required, string;
// - hashtags?: optional, string[];

// Turn Date -> "YYYY-MM-DDTHH:mm:ssZ" (strip milliseconds)
const toIsoSeconds = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z");

export const SocialPostSchema = z.object({
  platform: z
    .string()
    // "X" formerly known as Twitter is 1 character long lol.
    .min(1, "Insert which social media platform this post is on")
    // remove all leading and trailing white spaces
    .transform((s) => s.trim()),

  url: z
    .string()
    // .url ensures that the input is a valid url
    .url("Please enter a valid URL (must start with http/https)"),

  caption: z.string().min(1, "Add the caption for this social post"),

  hashtags: z.preprocess((val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === "string") {
      return val
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((s) => s.replace(/^#/, "")); // strip leading '#'
    }
    return [];
  }, z.array(z.string()).optional().default([])),
});

// Infer a TypeScript type directly from the Zod schema,
// so the form values stay in sync with validation.
export type SocialPostFormValues = z.infer<typeof SocialPostSchema>;

// Props for the reusable form component.
// - defaultValues: prefill (used for Edit)
// - onSubmit: parent handles create/update
// - onCancel: parent can close the modal
// - submitLabel: customize button label (“Create” / “Update” / “Save”)
export type SocialPostFormProps = {
  defaultValues?: Partial<SocialPostFormValues>;
  onSubmit: (values: SocialPostFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitLabel?: string;
};

// The form component is intentionally “dumb” regarding API details.
// It only cares about values and validation; the parent manages mutations.
export default function SocialPostForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: SocialPostFormProps) {
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
  } = useForm<SocialPostFormValues>({
    resolver: zodResolver(SocialPostSchema),
    defaultValues: {
      // - platform: required, string;
      // - url: required, string;
      // - caption: required, string;
      // - hashtags?: optional, string[];
      platform: defaultValues?.platform ?? "",
      url: defaultValues?.url ?? "",
      caption: defaultValues?.caption ?? "",
      hashtags: defaultValues?.hashtags ?? [],
    },
  });

  // useEffect runs after the component renders; here, it ensures the form values stay in sync
  // by calling reset() whenever defaultValues change (e.g., editing a different social post row).
  useEffect(() => {
    reset({
      platform: defaultValues?.platform ?? "",
      url: defaultValues?.url ?? "",
      caption: defaultValues?.caption ?? "",
      hashtags: defaultValues?.hashtags ?? [],
    });
  }, [defaultValues, reset]);

  return (
    <form onSubmit={handleSubmit((v) => onSubmit(v))} className="grid gap-3">
      {/* Platform */}
      <label className="grid gap-1">
        <span className="text-sm font-medium">Platform</span>
        <input
          className="border rounded px-3 py-2"
          placeholder="e.g., Instagram, YouTube, X"
          {...register("platform")}
        />
        {errors.platform && (
          <span className="text-red-600 text-sm">
            {errors.platform.message?.toString()}
          </span>
        )}
      </label>

      {/* URL */}
      <label className="grid gap-1">
        <span className="text-sm font-medium">Post URL</span>
        <input
          className="border rounded px-3 py-2"
          placeholder="https://www.instagram.com/p/..."
          {...register("url")}
        />
        {errors.url && (
          <span className="text-red-600 text-sm">
            {errors.url.message?.toString()}
          </span>
        )}
      </label>

      {/* Caption */}
      <label className="grid gap-1">
        <span className="text-sm font-medium">Caption</span>
        <textarea
          className="border rounded px-3 py-2 min-h-[96px]"
          placeholder="Write the post caption..."
          {...register("caption")}
        />
        {errors.caption && (
          <span className="text-red-600 text-sm">
            {errors.caption.message?.toString()}
          </span>
        )}
      </label>

      {/* Hashtags (comma-separated) */}
      <label className="grid gap-1">
        <span className="text-sm font-medium">Hashtags (comma-separated)</span>
        <input
          className="border rounded px-3 py-2"
          placeholder="#DMV, #Active"
          {...register("hashtags" as any)} // one text field, comma-separated
        />
        {errors.hashtags && (
          <span className="text-red-600 text-sm">
            {errors.hashtags.message?.toString?.() ?? "Invalid hashtags"}
          </span>
        )}
      </label>

      {/* Actions */}
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
