// jsPDF's built-in standard fonts use WinAnsi encoding, which is missing
// ğ/ı/ş/İ/Ğ/Ş (unlike ç/ö/ü, which render fine) — they come out blank or as
// the wrong glyph. Transliterate just those six letters for PDF text only;
// Excel/CSV/the UI are unaffected.
const TURKISH_TO_PDF_SAFE: Record<string, string> = {
  ğ: 'g',
  Ğ: 'G',
  ı: 'i',
  İ: 'I',
  ş: 's',
  Ş: 'S',
}

export function pdfSafe(text: string): string {
  return text.replace(/[ğĞıİşŞ]/g, (ch) => TURKISH_TO_PDF_SAFE[ch])
}
