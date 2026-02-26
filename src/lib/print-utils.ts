/**
 * Helper to align text for thermal printers (monospace)
 */
export function alignText(left: string, right: string, width: number = 32): string {
  const leftLen = left.length;
  const rightLen = right.length;
  const spaces = width - leftLen - rightLen;

  if (spaces <= 0) {
    // If text is too long, we might need to truncate or wrap, 
    // but for simplicity we'll just return with 1 space
    return `${left} ${right}`;
  }

  return `${left}${" ".repeat(spaces)}${right}`;
}

/**
 * Center text for a given width
 */
export function centerText(text: string, width: number = 32): string {
  if (text.length >= width) return text;
  const spaces = Math.floor((width - text.length) / 2);
  return " ".repeat(spaces) + text;
}

/**
 * Generate a separator line
 */
export function separator(char: string = "-", width: number = 32): string {
  return char.repeat(width);
}

/**
 * Format currency without the 'Rp' prefix and dots for simpler receipt look if needed,
 * but user asked for IDR format. We'll use the existing formatCurrency but maybe a cleaner version for receipt.
 */
export function formatReceiptCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "decimal",
    minimumFractionDigits: 0,
  }).format(value);
}
