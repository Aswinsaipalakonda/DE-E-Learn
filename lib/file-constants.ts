// Allowed upload extensions across faculty materials, upload form, and replacement dialogs
export const ALLOWED_EXTENSIONS = [
  // Documents & Presentations
  ".pdf", ".ppt", ".pptx", ".doc", ".docx", ".txt", ".md", ".rtf", ".odt",
  // Spreadsheets & Data
  ".xls", ".xlsx", ".csv",
  // Coding & Source Files
  ".py", ".java", ".c", ".cpp", ".h", ".cs", ".js", ".ts", ".tsx", ".jsx", ".html", ".css", ".json", ".sql", ".ipynb", ".sh", ".xml", ".yaml", ".yml",
  // Archives
  ".zip", ".rar", ".7z", ".tar", ".gz",
  // Images
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".svg"
];

export const ALLOWED_EXTENSIONS_STRING = ALLOWED_EXTENSIONS.join(", ");
