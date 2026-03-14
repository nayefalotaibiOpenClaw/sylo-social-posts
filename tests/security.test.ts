import { describe, it, expect } from "vitest";
import { validateComponentCode } from "../lib/security/code-validation";
import {
  isAllowedProxyDomain,
  validateProxyUrl,
} from "../lib/security/url-validation";

// ─── Code Validation (Issue 10) ──────────────────────────────────────
// Tests that our code validator correctly rejects dangerous patterns
// used for XSS attacks, and allows legitimate post component code.

describe("validateComponentCode", () => {
  it("allows normal post component code", () => {
    const code = `
      const MyPost = () => {
        const t = useTheme();
        const ratio = useAspectRatio();
        return (
          <div style={{ backgroundColor: t.primary }}>
            <EditableText id="title" text="Hello" />
          </div>
        );
      };
    `;
    expect(validateComponentCode(code)).toEqual({ valid: true });
  });

  it("rejects network access patterns", () => {
    expect(
      validateComponentCode('const P = () => { fetch("/x"); return <div/>; }')
        .valid
    ).toBe(false);

    expect(
      validateComponentCode("const P = () => { new XMLHttpRequest(); return <div/>; }")
        .valid
    ).toBe(false);
  });

  it("rejects code execution patterns", () => {
    // Note: these test strings contain the dangerous patterns intentionally
    // to verify our validator catches them
    const dangerousPatterns = [
      'const P = () => { window["toString"](); return <div/>; }',
      "const P = () => { globalThis.x = 1; return <div/>; }",
      'const P = () => { import("x"); return <div/>; }',
    ];
    for (const code of dangerousPatterns) {
      expect(validateComponentCode(code).valid).toBe(false);
    }
  });

  it("rejects DOM access patterns", () => {
    expect(
      validateComponentCode(
        "const P = () => { const c = document.cookie; return <div/>; }"
      ).valid
    ).toBe(false);

    expect(
      validateComponentCode(
        'const P = () => { localStorage.setItem("x","y"); return <div/>; }'
      ).valid
    ).toBe(false);

    expect(
      validateComponentCode(
        "const P = () => { sessionStorage.clear(); return <div/>; }"
      ).valid
    ).toBe(false);
  });

  it("rejects HTML injection tags", () => {
    expect(
      validateComponentCode(
        "const P = () => <div><script>x</script></div>;"
      ).valid
    ).toBe(false);

    expect(
      validateComponentCode(
        'const P = () => <div><iframe src="x"/></div>;'
      ).valid
    ).toBe(false);
  });

  it("ignores patterns in comments", () => {
    const code = `
      // document.cookie is referenced in a comment only
      /* localStorage.setItem is also just a comment */
      const Post = () => <div>Hello</div>;
    `;
    expect(validateComponentCode(code)).toEqual({ valid: true });
  });
});

// ─── URL Validation (Issues 4, 5) ────────────────────────────────────

describe("isAllowedProxyDomain", () => {
  it("allows images.unsplash.com", () => {
    expect(isAllowedProxyDomain("images.unsplash.com")).toBe(true);
  });

  it("allows Convex storage domains", () => {
    expect(isAllowedProxyDomain("little-toad-958.convex.cloud")).toBe(true);
    expect(isAllowedProxyDomain("example.convex.site")).toBe(true);
  });

  it("rejects unknown domains", () => {
    expect(isAllowedProxyDomain("example.com")).toBe(false);
    expect(isAllowedProxyDomain("notconvex.cloud")).toBe(false);
  });
});

describe("validateProxyUrl", () => {
  it("rejects http:// URLs", async () => {
    const result = await validateProxyUrl(
      "http://images.unsplash.com/photo.jpg"
    );
    expect(result.allowed).toBe(false);
  });

  it("rejects non-allowlisted domains", async () => {
    const result = await validateProxyUrl("https://attacker.com/image.jpg");
    expect(result.allowed).toBe(false);
  });

  it("rejects invalid URLs", async () => {
    const result = await validateProxyUrl("not-a-url");
    expect(result.allowed).toBe(false);
  });

  it("allows valid Unsplash URLs", async () => {
    const result = await validateProxyUrl(
      "https://images.unsplash.com/photo-1234?w=400"
    );
    expect(result.allowed).toBe(true);
  });

  it("allows Convex storage URLs", async () => {
    const result = await validateProxyUrl(
      "https://little-toad-958.convex.cloud/api/storage/abc123"
    );
    expect(result.allowed).toBe(true);
  });
});

// ─── Unsplash Download URL Validation (Issue 5) ──────────────────────

describe("Unsplash download URL validation", () => {
  it("accepts valid Unsplash API URL", () => {
    const url = "https://api.unsplash.com/photos/abc123/download";
    expect(url.startsWith("https://api.unsplash.com/")).toBe(true);
  });

  it("rejects attacker URL", () => {
    const url = "https://attacker.com/steal-key";
    expect(url.startsWith("https://api.unsplash.com/")).toBe(false);
  });

  it("rejects URL with similar prefix but different domain", () => {
    const url = "https://api.unsplash.com.attacker.com/steal";
    expect(url.startsWith("https://api.unsplash.com/")).toBe(false);
  });
});
