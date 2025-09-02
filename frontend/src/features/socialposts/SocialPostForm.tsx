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
    <form
      // disable native browser validation UI
      noValidate
      onSubmit={handleSubmit((v) => onSubmit(v))}
      className="form-card"
    >
      {/* Platform */}
      <div className="field">
        <label
          style={{ color: "white" }}
          className="label"
          htmlFor="social-post-platform"
        >
          Platform
        </label>
        <input
          id="social-post-platform"
          style={{ color: "#111827" }}
          className={`input ${errors.platform ? "input--error" : ""}`}
          placeholder="e.g., Instagram, YouTube, X"
          aria-invalid={!!errors.platform}
          aria-describedby={
            errors.platform ? "social-post-platform-error" : undefined
          }
          {...register("platform")}
        />
        {errors.platform && (
          <div id="social-post-platform-error" className="error">
            {errors.platform.message?.toString()}
          </div>
        )}
      </div>

      {/* URL */}
      <div className="field">
        <label
          style={{ color: "white" }}
          className="label"
          htmlFor="social-post-url"
        >
          Post URL
        </label>
        <input
          id="social-post-url"
          style={{ color: "#111827" }}
          className={`input ${errors.url ? "input--error" : ""}`}
          placeholder="https://www.instagram.com/p/..."
          aria-invalid={!!errors.url}
          aria-describedby={
            errors.url ? "social-post-url-error" : "social-post-url-help"
          }
          {...register("url")}
        />

        {!errors.url && (
          <div id="soical-post-url-help" className="help">
            Must start with http/https
          </div>
        )}
        {errors.url && (
          <div id="social-post-url-error" className="error">
            {errors.url.message?.toString()}
          </div>
        )}
      </div>

      {/* Caption */}
      <label className="grid gap-1">
        <span className="text-sm font-medium">Caption</span>
        <textarea
          id="social-post-caption"
          style={{ color: "#111827" }}
          className={`input ${errors.caption ? "input--error" : ""}`}
          placeholder="Write the post caption..."
          aria-invalid={!!errors.caption}
          aria-describedby={errors.caption ? "social-post-caption-error" : undefined}
          {...register("caption")}
        />
        {errors.caption && (
          <div id="social-post-caption-error" className="error">
            {errors.caption.message?.toString()}
          </div>
        )}
      </label>

      {/* Hashtags (comma-separated) */}
      <div className="field">
        <label
          style={{ color: "white" }}
          className="label"
          htmlFor="social-post-hashtags"
        >
          Hashtags (comma-separated)
          <input
            id="social-post-hashtags"
            style={{ color: "#111827" }}
            className={`input ${errors.hashtags ? "input--error" : ""}`}
            placeholder="#DMV, #Active"
            aria-invalid={!!errors.hashtags}
            aria-describedby={
              errors.hashtags ? "video-tags-error" : "video-tags-help"
            }
            // one text field, comma-separated; schema preprocess accepts either a string or an array
            {...register("hashtags" as any)}
          />
          {!errors.hashtags && (
            <div id="social-posts-tags-help" className="help">
              Example: dmv, interview, studio
            </div>
          )}
          {errors.hashtags && (
            <div id="social-posts-hashtags-error" className="error">
              {errors.hashtags.message?.toString()}
            </div>
          )}
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pt-3">
        <button
          type="button"
          onClick={onCancel}
          // Visible on white modal; clear affordance
          className="px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          Cancel
        </button>

        <button
          type="submit"
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
