import { AxiosError } from "axios";

/**
 * Inspects a React Query `error` object to determine the HTTP status.
 * Works for any query or mutation that uses apiClient (Axios).
 */
function getErrorStatus(error: unknown): number | null {
  if (error instanceof AxiosError) {
    return error.response?.status ?? null;
  }
  return null;
}

/**
 * useApiError
 *
 * Usage:
 *   const { data, error } = useAdmins();
 *   const { isAccessDenied } = useApiError(error);
 *   if (isAccessDenied) return <AccessDenied variant="page" />;
 */
export function useApiError(error: unknown) {
  const status = getErrorStatus(error);

  return {
    /** True when the API returned 403 Forbidden */
    isAccessDenied: status === 403,
    /** True when the API returned 404 Not Found */
    isNotFound: status === 404,
    /** True when the API returned 500 */
    isServerError: status === 500,
    /** The raw HTTP status code (null if not an Axios error) */
    status,
  };
}
