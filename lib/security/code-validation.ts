/**
 * Code validation for dynamic post components.
 *
 * Rejects component code that contains patterns which could be used for
 * XSS or data exfiltration when evaluated at runtime.
 */

const DANGEROUS_PATTERNS: { pattern: RegExp; label: string }[] = [
  { pattern: /\bfetch\s*\(/, label: "fetch(" },
  { pattern: /\bXMLHttpRequest\b/, label: "XMLHttpRequest" },
  { pattern: /\bimport\s*\(/, label: "dynamic import(" },
  { pattern: /\brequire\s*\(/, label: "require(" },
  { pattern: /\bdocument\.cookie\b/, label: "document.cookie" },
  { pattern: /\blocalStorage\b/, label: "localStorage" },
  { pattern: /\bsessionStorage\b/, label: "sessionStorage" },
  { pattern: /\beval\s*\(/, label: "eval(" },
  { pattern: /\bnew\s+Function\s*\(/, label: "new Function(" },
  { pattern: /\bwindow\.location\b/, label: "window.location" },
  { pattern: /\bwindow\.open\b/, label: "window.open" },
  { pattern: /<script\b/i, label: "<script>" },
  { pattern: /<iframe\b/i, label: "<iframe>" },
  { pattern: /\bwindow\s*\[/, label: "window[" },
  { pattern: /\bglobalThis\b/, label: "globalThis" },
  { pattern: /\bimportScripts\s*\(/, label: "importScripts(" },
  { pattern: /\bdocument\.(write|writeln)\s*\(/, label: "document.write" },
  {
    pattern: /\bdocument\.createElement\s*\(\s*['"]script['"]/,
    label: "createElement('script')",
  },
];

export interface CodeValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Validate that component code doesn't contain dangerous runtime patterns.
 * Strips comments before scanning to avoid false positives.
 */
export function validateComponentCode(code: string): CodeValidationResult {
  // Strip comments to avoid false positives
  const stripped = code
    .replace(/\/\/.*$/gm, "") // single-line comments
    .replace(/\/\*[\s\S]*?\*\//g, ""); // multi-line comments

  for (const { pattern, label } of DANGEROUS_PATTERNS) {
    if (pattern.test(stripped)) {
      return {
        valid: false,
        reason: `Code contains forbidden pattern: ${label}`,
      };
    }
  }
  return { valid: true };
}
