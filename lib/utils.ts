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

export const BRANCH_NAMES: Record<string, string> = {
  CIC: "Cyber Security & IoT",
  CSD: "Data Science",
  CSM: "Artificial Intelligence & Machine Learning",
};

/**
 * Returns the full official department name for a branch code (e.g., CSM -> Artificial Intelligence & Machine Learning).
 */
export function getBranchFullName(branchCode: string | null | undefined): string {
  if (!branchCode) return "Academic Department";
  const upper = branchCode.toUpperCase().trim();
  return BRANCH_NAMES[upper] || `${upper} Department`;
}

/**
 * Accurately resolves standard branch code ("CIC" | "CSD" | "CSM") from branch name/code
 * or college roll number pattern without false positives on student serial numbers.
 */
export function resolveBranchCode(rawBranch?: string | null, rawRoll?: string | null): "CIC" | "CSD" | "CSM" {
  const b = (rawBranch || "").toUpperCase().trim();
  const r = (rawRoll || "").toUpperCase().trim();

  // 1. Exact or keyword match on rawBranch first
  if (b === "CSM" || b.includes("CSM") || b.includes("MACHINE") || b.includes("ARTIFICIAL")) return "CSM";
  if (b === "CIC" || b.includes("CIC") || b.includes("CYBER") || b.includes("IOT")) return "CIC";
  if (b === "CSD" || b.includes("CSD") || b.includes("DATA SCIENCE")) return "CSD";

  // 2. Parse 2-digit branch code after 1A or 5A in 10-char roll number (e.g. 23331A4205, 24335A4205)
  const match = r.match(/(?:1A|5A)([0-9A-Z]{2})/);
  if (match) {
    const code = match[1];
    if (code === "42") return "CSM";
    if (code === "47") return "CIC";
    if (code === "05" || code === "44") return "CSD";
  }

  // 3. Fallback anchored matching
  if (r.includes("A42") || r.includes("CSM")) return "CSM";
  if (r.includes("A47") || r.includes("CIC")) return "CIC";
  if (r.includes("A05") || r.includes("A44") || r.includes("CSD")) return "CSD";

  return "CIC";
}
