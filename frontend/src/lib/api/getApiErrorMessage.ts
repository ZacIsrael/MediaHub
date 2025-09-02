// Used for processing error messages from backend API
export function getApiErrorMessage(err: any): string {
  const data = err?.response?.data;
  if (typeof data === "string") return data;
  return (
    data?.message ||
    data?.error ||
    data?.errors?.[0]?.message || 
    err?.message ||
    "Something went wrong"
  );
}
