import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getBookingById } from "../../lib/api/bookings";

function getErrorMessage(err: any) {
  // axios error → prefer server message if present
  return (
    err?.response?.data?.message || err?.message || "Failed to load booking."
  );
}

export default function BookingDetailPage() {
  // '1' (string)
  const { id } = useParams();
  // converts the id to a number; '1' -> 1 (number)
  const bookingId = Number(id);

  const {
    data: response,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ["booking", bookingId],
    enabled: Number.isFinite(bookingId),
    // retreive the booking by its id
    queryFn: () => getBookingById(bookingId),
  });

  if (!Number.isFinite(bookingId)) {
    return <div className="p-4 text-red-600">Invalid booking id.</div>;
  }

  if (isLoading) return <div className="p-4">Loading…</div>;

  // If server returned 404, we'll be here.
  if (isError) {
    return (
      <div className="p-4">
        <p className="text-red-600">{getErrorMessage(error)}</p>
        <Link to="/dashboard/bookings" className="underline">
          ← Back to Bookings
        </Link>
      </div>
    );
  }

  // debugging
  console.log("BookingDetailPage: response = ", response);
  /*
   if found, data/response structure = { 
   booking: {
        "client_id": 1,
        "event_date": "2026-03-19T14:00:00.000Z",
        "event_type": "1 year-old birthday party",
        "price": "250.00",
        "status": "pending",
        "created_at": "2025-08-06T16:12:44.795Z",
        "updated_at": "2025-08-06T16:12:44.795Z")
        }
    }

    */
  /* 
  if booking with id does not exist, data/response structure = { 
    message: "There is no booking with id = 30 in the bookings table.", 
    booking: null
  } 
  */

  // If server returned 200 or 404 but with booking: null
  if (!response || !response.booking) {
    return (
      <div className="p-4">
        <p>{response?.message ?? "Booking not found."}</p>
        <Link to="/dashboard/bookings" className="underline">
          ← Back to Bookings
        </Link>
      </div>
    );
  }

  // Destructure and access all the fields from the returned booking
  const {
    id: bId,
    client_id,
    event_date,
    event_type,
    price,
    status,
    created_at,
    updated_at,
  } = response.booking;

  console.log(
    `id = ${bId}, client_id = ${client_id}, event_date = ${event_date}, event_type = ${event_type}, price = ${price}, status = ${status}`
  );
  return (
    <div className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Booking #{bId}</h1>
        <Link to="/dashboard/bookings" className="underline">
          ← Back to Bookings
        </Link>
      </div>

      <div className="grid gap-2">
        <DetailRow label="Client ID: " value={client_id} />
        <DetailRow label="Event Type: " value={event_type} />
        <DetailRow
          label="Event Date: "
          value={new Date(event_date).toLocaleString()}
        />
        <DetailRow label="Price: " value={`$${Number(price).toFixed(2)}`} />
        {status && <DetailRow label="Status" value={status} />}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: any }) {
  return (
    <div className="grid grid-cols-[160px_1fr]">
      <div className="text-sm text-gray-500">{label}</div>
      <div>{String(value ?? "—")}</div>
    </div>
  );
}
