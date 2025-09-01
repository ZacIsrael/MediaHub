// Purpose: Reusable form for Create/Edit video
// Tech used: React Hook Form for state/validation plumbing, Zod for schema validation.

// React effect (to reset form when defaultValues change)
import { useEffect } from "react";
// React Hook Form main API
import { useForm } from "react-hook-form";
// Zod: schema & runtime validation
import { z } from "zod";
// Bridge so React Hook Form can use Zod for validation
import { zodResolver } from "@hookform/resolvers/zod";

// Define validation rules for a video (see video.dto file in backend)
// - title: required, string
// - url: required, string
// - tags: optional, Array of strings
// - viewCount: required, number
// - publishedAt: required, string (Date)

// Turn Date -> "YYYY-MM-DDTHH:mm:ssZ" (strip milliseconds)
const toIsoSeconds = (d: Date) => d.toISOString().replace(/\.\d{3}Z$/, "Z");

export const VideoSchema = z.object({
  title: z
    .string()
    // remove all leading and trailing white spaces
    .trim()
    .min(1, "A title for this video is required"),

  url: z
    .string()
    // remove all leading and trailing white spaces
    .trim()
    // .url ensures that the input is a valid url
    .url("Please enter a valid URL (must start with http/https)"),
  tags: z.preprocess(
    (val) => {
      // If the form gives an array already, keep it
      if (Array.isArray(val)) return val;

      // If the form gives a single string (e.g., "dmv, interview, kevin"),
      // split by commas, trim, and drop any empty strings
      if (typeof val === "string") {
        return val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
      }
      // Anything else → treat as empty array
      return [];
    },
    // optional, defaults to []
    z.array(z.string().min(1)).optional().default([])
  ),
  // coerce converts the input to a number (i.e "9087" --> 9087)
  viewCount: z.coerce
    .number()
    // a video can't have a negative view count
    .min(0, "View count must be at least 0.")
    .refine(Number.isFinite, "A video can't have an infinite number of views"),

  // Accept user-friendly strings from inputs and transform to strict ISO seconds UTC
  // .preprocess() allows the raw value to be converted into the specified shape
  publishedAt: z.preprocess(
    (val) => {
      if (typeof val === "string" && val.trim().length > 0) {
        // Handle both "YYYY-MM-DD" and "YYYY-MM-DDTHH:mm" (from date/datetime-local)
        const d = new Date(val);
        if (!isNaN(d.getTime())) return toIsoSeconds(d);
      }
      return val;
    },
    // regex for how the date is processed in the backend (refer to videos.interface,
    // publishedAt is of SQL type Date in MongoDB, i.e. 2025-09-16T14:00:00Z)
    z
      .string()
      .regex(
        /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/,
        "Event date must be ISO like 'YYYY-MM-DDTHH:mm:ssZ'"
      )
  ),
});

// Infer a TypeScript type directly from the Zod schema,
// so the form values stay in sync with validation.
export type VideoFormValues = z.infer<typeof VideoSchema>;

// Props for the reusable form component.
// - defaultValues: prefill (used for Edit)
// - onSubmit: parent handles create/update
// - onCancel: parent can close the modal
// - submitLabel: customize button label (“Create” / “Update” / “Save”)
export type VideoFormProps = {
  defaultValues?: Partial<VideoFormValues>;
  onSubmit: (values: VideoFormValues) => Promise<void> | void;
  onCancel: () => void;
  submitLabel?: string;
};

// The form component is intentionally “dumb” regarding API details.
// It only cares about values and validation; the parent manages mutations.
export default function VideoForm({
  defaultValues,
  onSubmit,
  onCancel,
  submitLabel = "Save",
}: VideoFormProps) {
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
  } = useForm<VideoFormValues>({
    resolver: zodResolver(VideoSchema), // use Zod schema for validation
    /**
     * NOTE: RHF inputs emit strings. Schema uses z.coerce.number(),
     * number fields can be safely seeded as "" (empty string) and they’ll coerce on submit.
     */
    defaultValues: {
      // - title: required, string
      // - url: required, string
      // - tags: optional, Array of strings
      // - viewCount: required, number
      // - publishedAt: required, string (Date)
      title: defaultValues?.title ?? "",
      url: defaultValues?.url ?? "",
      tags: defaultValues?.tags ?? [""],
      viewCount: defaultValues?.viewCount ?? 0,
      publishedAt: defaultValues?.publishedAt ?? "",
    },
  });

  // useEffect runs after the component renders; here, it ensures the form values stay in sync
  // by calling reset() whenever defaultValues change (e.g., editing a different video row).
  useEffect(() => {
    reset({
      title: defaultValues?.title ?? "",
      url: defaultValues?.url ?? "",
      tags: defaultValues?.tags ?? [""],
      viewCount: (defaultValues?.viewCount as any) ?? (0 as any),
      publishedAt: defaultValues?.publishedAt ?? "",
    });
  }, [defaultValues, reset]);

  return (
    <form
    // disable native browser validation UI
      noValidate 
      onSubmit={handleSubmit((v) => onSubmit(v))}
      className="form-card"
    >
      {/* Title */}
      <div className="field">
        <label style={{ color: "white" }} className="label" htmlFor="video-title">
          Title
        </label>
        <input
          id="video-title"
          style={{ color: "#111827" }}
          className={`input ${errors.title ? "input--error" : ""}`}
          placeholder="e.g., KP Skywalka Interview"
          aria-invalid={!!errors.title}
          aria-describedby={errors.title ? "video-title-error" : undefined}
          {...register("title")}
        />
        {errors.title && (
          <div id="video-title-error" className="error">
            {errors.title.message?.toString()}
          </div>
        )}
      </div>

      {/* URL */}
      <div className="field">
        <label style={{ color: "white" }} className="label" htmlFor="video-url">
          Video URL
        </label>
        <input
          id="video-url"
          style={{ color: "#111827" }}
          className={`input ${errors.title ? "input--error" : ""}`}
          placeholder="https://www.youtube.com/watch?v=..."
          aria-invalid={!!errors.url}
          aria-describedby={errors.url ? "video-url-error" : "video-url-help"}
          {...register("url")}
        />
        {!errors.url && (
          <div id="video-url-help" className="help">
            Must start with http/https
          </div>
        )}
        {errors.url && (
          <div id="video-url-error" className="error">
            {errors.url.message?.toString()}
          </div>
        )}
      </div>

      {/* Tags (comma-separated) */}
      <div className="field">
        <label style={{ color: "white" }} className="label" htmlFor="video-tags">
          Tags (comma-separated)
        </label>
        <input
          id="video-tags"
          style={{ color: "#111827" }}
          className={`input ${errors.title ? "input--error" : ""}`}
          placeholder="dmv, interview, studio"
          aria-invalid={!!errors.tags}
          aria-describedby={
            errors.tags ? "video-tags-error" : "video-tags-help"
          }
          // schema preprocess accepts either a string or an array
          {...register("tags" as any)}
        />
        {!errors.tags && (
          <div id="video-tags-help" className="help">
            Example: dmv, interview, studio
          </div>
        )}
        {errors.tags && (
          <div id="video-tags-error" className="error">
            {errors.tags.message?.toString()}
          </div>
        )}
      </div>

      {/* View Count */}
      <div className="field">
        <label style={{ color: "white" }} className="label" htmlFor="video-views">
          View Count
        </label>
        <input
          id="video-views"
          style={{ color: "#111827" }}
          type="number"
          min={0}
          className={`input ${errors.title ? "input--error" : ""}`}
          placeholder="e.g., 12345"
          aria-invalid={!!errors.viewCount}
          aria-describedby={errors.viewCount ? "video-views-error" : undefined}
          {...register("viewCount" as const)}
        />
        {errors.viewCount && (
          <div id="video-views-error" className="error">
            {errors.viewCount.message?.toString()}
          </div>
        )}
      </div>

      {/* Published At */}
      <div className="field">
        <label style={{ color: "white" }} className="label" htmlFor="video-published">
          Published At
        </label>
        <input
          id="video-published"
          style={{ color: "#111827" }}
          type="datetime-local"
          className={`input ${errors.title ? "input--error" : ""}`}
          placeholder="YYYY-MM-DDTHH:mm"
          aria-invalid={!!errors.publishedAt}
          aria-describedby={
            errors.publishedAt
              ? "video-published-error"
              : "video-published-help"
          }
          {...register("publishedAt")} 
        />
        {!errors.publishedAt && (
          <div id="video-published-help" className="help">
            {/* We’ll convert local time to strict UTC (YYYY-MM-DDTHH:mm:ssZ) */}
          </div>
        )}
        {errors.publishedAt && (
          <div id="video-published-error" className="error">
            {errors.publishedAt.message?.toString()}
          </div>
        )}
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
