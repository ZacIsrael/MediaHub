// Import React’s state to manage the form inputs
import { useState } from "react";
// Import React Query for the create mutation + cache invalidation
import { useMutation, useQueryClient } from "@tanstack/react-query";
// Import your existing API call that creates a client
import { createClient } from "../../lib/api/clients";

import type { Client, CreateClientInput } from "../../lib/api/types";
import ClientForm, { type ClientFormValues } from "./ClientForm";
// Define the modal component props
export default function CreateClientModal({
  open,
  onClose,
  onCreated,
}: {
  open: boolean;
  onClose: () => void;
  onCreated: (client: Client) => void;
}) {
  // Get the query client so we can refresh the clients list after create
  const qc = useQueryClient();

  // Create a mutation that calls createClient API
  const { mutateAsync, isPending } = useMutation<
    Client,
    unknown,
    CreateClientInput
  >({
    // Tell React Query how to perform the create
    mutationFn: async (values) => {
      // Error checking

      // make API with the new client payload
      return await createClient(values);
    },
    // When successful, refresh any cached client lists
    onSuccess: (created) => {
      // 1) Optimistically add to current options
      qc.setQueryData<Client[]>(["client-options"], (old) =>
        old ? [...old, created] : [created]
      );
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

        <ClientForm
          defaultValues={{ name: "", email: "", phone: "" }}
          onSubmit={async (values: ClientFormValues) => {
            // make API call with validated payload (name, email, phone)
            const client = await mutateAsync(values);
            // created client (that contains the id) goes to the parent booking form
            onCreated(client);
            onClose();
          }}
          // Allow user to cancel/close without saving
          onCancel={onClose}
          // Disable submit button while request is inflight
          submitLabel={isPending ? "Saving..." : "Save"}
        />
      </div>
    </div>
  );
}
