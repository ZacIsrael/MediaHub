

// Import React’s state to manage the form inputs
import { useState } from "react";
// Import React Query for the create mutation + cache invalidation
import { useMutation, useQueryClient } from "@tanstack/react-query";
// Import your existing API call that creates a client
import { createClient } from "../../lib/api/clients";

// Define the modal component props
export default function CreateClientModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (client: { id: number; name: string }) => void;
}) {
  // Local state for the new client’s name field
  const [name, setName] = useState("");
  // Local state for the new client’s email field
  const [email, setEmail] = useState("");
  // Get the query client so we can refresh the clients list after create
  const qc = useQueryClient();

  // Create a mutation that calls createClient API
  const { mutateAsync, isPending } = useMutation({
    // Tell React Query how to perform the create
    mutationFn: async () => {
      // make API with the new client payload
      return await createClient({ name, email });
    },
    // When successful, refresh any cached client lists
    onSuccess: () => {
      // Invalidate the cache so dropdowns refetch fresh options
      qc.invalidateQueries({ queryKey: ["client-options"] });
    },
  });

  // Hide the entire modal when not open
  if (!open) return null;

  // Render a simple modal UI
  return (
    // Backdrop to dim the page behind the modal
    <div className="modal-backdrop">
      {/* The modal panel that contains the form */}
      <div className="modal">
        {/* Title to describe what this modal does */}
        <h3>Create Client</h3>

        {/* Field for the client name (required) */}
        <label>Name *</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        {/* Field for the client email (optional in UI) */}
        {/* <label>Email (optional)</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        /> */}

        {/* Action buttons to cancel or save */}
        <div className="actions">
          {/* Close the modal without saving */}
          <button onClick={onClose} disabled={isPending}>
            Cancel
          </button>
          {/* Save the new client then notify the parent */}
          <button
            onClick={async () => {
              // Create the client on the server
              const client = await mutateAsync();
              // Pass the created client back to the parent
              onCreated(client);
              // Reset local inputs for next time
              setName("");
              setEmail("");
              // Close the modal after success
              onClose();
            }}
            disabled={!name || isPending}
          >
            {isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
