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
    .min(1, "A title for this video is required")
    // remove all leading and trailing white spaces
    .transform((s) => s.trim()),

  url: z
    .string()
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
    <form onSubmit={handleSubmit((v) => onSubmit(v))} className="grid gap-3">
      {/* Title */}
      <label className="grid gap-1">
        <span className="text-sm font-medium">Title</span>
        <input
          className="border rounded px-3 py-2"
          placeholder="e.g., KP Skywalka Interview"
          {...register("title")}
        />
        {errors.title && (
          <span className="text-red-600 text-sm">
            {errors.title.message?.toString()}
          </span>
        )}
      </label>

      {/* URL */}
      <label className="grid gap-1">
        <span className="text-sm font-medium">Video URL</span>
        <input
          className="border rounded px-3 py-2"
          placeholder="https://www.youtube.com/watch?v=..."
          {...register("url")}
        />
        {errors.url && (
          <span className="text-red-600 text-sm">
            {errors.url.message?.toString()}
          </span>
        )}
      </label>

      {/* Tags (comma-separated) */}
      <label className="grid gap-1">
        <span className="text-sm font-medium">Tags (comma-separated)</span>
        <input
          className="border rounded px-3 py-2"
          placeholder="dmv, interview, studio"
          // schema preprocess accepts either a string or an array
          {...register("tags" as any)}
        />
        {errors.tags && (
          <span className="text-red-600 text-sm">
            {errors.tags.message?.toString()}
          </span>
        )}
      </label>

      {/* View Count */}
      <label className="grid gap-1">
        <span className="text-sm font-medium">View Count</span>
        <input
          type="number"
          min={0}
          className="border rounded px-3 py-2"
          placeholder="e.g., 12345"
          {...register("viewCount" as const)}
        />
        {errors.viewCount && (
          <span className="text-red-600 text-sm">
            {errors.viewCount.message?.toString()}
          </span>
        )}
      </label>

      {/* Published At */}
      <label className="grid gap-1">
        <span className="text-sm font-medium">Published At</span>
        {/* Browser returns 'YYYY-MM-DDTHH:mm' in local time; schema preprocess normalizes to strict UTC ISO seconds */}
        <input
          type="datetime-local"
          className="border rounded px-3 py-2"
          placeholder="YYYY-MM-DDTHH:mm"
          {...register("publishedAt")}
        />
        {errors.publishedAt && (
          <span className="text-red-600 text-sm">
            {errors.publishedAt.message?.toString()}
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
