/**
 * Konfigurasi URL Gateway Backend FreeAPI
 * Mengambil nilai dari environment variable NEXT_PUBLIC_API_URL jika ada.
 * Default ke "http://localhost:8000" saat local development.
 */
export const API_BASE_URL: string =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/+$/, "")
    : "http://localhost:8000") || "http://localhost:8000";
