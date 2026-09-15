export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Normalizes subject titles by replacing unknown/corrupted symbols (e.g. â€¢, •, etc.)
 * with clean word separators (' | ') and trimming unnecessary whitespace.
 */
export function formatSubjectTitle(title: string | null | undefined): string {
  if (!title) return "";
  return title
    .replace(/(?:â€¢|\u2022|\uF0B7|\uF0A7|\u00B7|â\u0080\u00A2)/g, " | ")
    .replace(/\u2013|\u2014/g, "-")
    .replace(/\s*\|\s*/g, " | ")
    .replace(/^\s*\|\s*|\s*\|\s*$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}
