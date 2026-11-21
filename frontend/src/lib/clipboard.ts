/**
 * Salin teks ke clipboard secara aman di semua perangkat (Desktop & Mobile, HTTPS & HTTP/LAN).
 * Menggunakan modern Clipboard API jika tersedia, dan fallback ke textarea + execCommand
 * untuk browser mobile atau konteks non-secure (misal pengujian via IP LAN http://192.168.x.x).
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  if (!text) return false;

  // 1. Coba Clipboard API modern jika didukung (HTTPS / localhost)
  if (
    typeof navigator !== "undefined" &&
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Jika izin ditolak atau gagal, lanjut ke fallback
    }
  }

  // 2. Fallback untuk Mobile / Non-HTTPS / WebViews
  if (typeof document !== "undefined") {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.setAttribute("readonly", "");
      textArea.style.position = "fixed";
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.width = "2em";
      textArea.style.height = "2em";
      textArea.style.padding = "0";
      textArea.style.border = "none";
      textArea.style.outline = "none";
      textArea.style.boxShadow = "none";
      textArea.style.background = "transparent";
      textArea.style.opacity = "0";
      textArea.style.zIndex = "-1";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      // Khusus Safari / iOS WebKit
      const range = document.createRange();
      range.selectNodeContents(textArea);
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
      textArea.setSelectionRange(0, 999999);

      const successful = document.execCommand("copy");
      document.body.removeChild(textArea);
      return successful;
    } catch (err) {
      console.warn("Fallback copy failed:", err);
      return false;
    }
  }

  return false;
}
