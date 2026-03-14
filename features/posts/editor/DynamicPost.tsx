"use client";

import React, { useMemo } from "react";
import { transform } from "sucrase";
import EditableText from "./EditableText";
import DraggableWrapper from "./DraggableWrapper";
import { useAspectRatio, useEditMode } from "@/contexts/EditContext";
import { useTheme } from "@/contexts/ThemeContext";
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard, IPadMockup, DesktopMockup } from "@/features/posts/shared";
import * as LucideIcons from "lucide-react";

interface DynamicPostProps {
  code: string;
}

// Strip string literals and JSX text content so validation only checks actual code
function stripStringsAndJSXText(code: string): string {
  return code
    // Remove template literals (including nested expressions is imperfect, but good enough)
    .replace(/`[^`]*`/g, '""')
    // Remove double-quoted strings
    .replace(/"(?:[^"\\]|\\.)*"/g, '""')
    // Remove single-quoted strings
    .replace(/'(?:[^'\\]|\\.)*'/g, "''")
    // Remove JSX text content (text between > and <)
    .replace(/>([^<]*)</g, '><');
}

// Validate code doesn't contain dangerous patterns before evaluation
function validateCode(code: string): string | null {
  const strippedCode = stripStringsAndJSXText(code);

  const dangerousPatterns = [
    { pattern: /\bwindow\s*[.[]/,    reason: "Access to 'window' is not allowed" },
    { pattern: /\bdocument\s*[.[]/,  reason: "Access to 'document' is not allowed" },
    { pattern: /\bfetch\s*\(/,       reason: "Network requests are not allowed" },
    { pattern: /\blocalStorage\b/,   reason: "Access to 'localStorage' is not allowed" },
    { pattern: /\bsessionStorage\b/, reason: "Access to 'sessionStorage' is not allowed" },
    { pattern: /\beval\s*\(/,        reason: "Use of 'eval' is not allowed" },
    { pattern: /\bFunction\s*\(/,    reason: "Dynamic Function construction is not allowed" },
    { pattern: /\bimportScripts\b/,  reason: "Script imports are not allowed" },
    { pattern: /\bXMLHttpRequest\b/, reason: "XHR requests are not allowed" },
    { pattern: /\bnew\s+WebSocket\b/,reason: "WebSocket connections are not allowed" },
    { pattern: /\bdocument\.cookie\b/,reason: "Cookie access is not allowed" },
    { pattern: /\b__proto__\b/,      reason: "Prototype manipulation is not allowed" },
    { pattern: /\bconstructor\s*\[/, reason: "Constructor access is not allowed" },
    { pattern: /\bglobalThis\b/,     reason: "Access to 'globalThis' is not allowed" },
    { pattern: /\bprocess\.env\b/,   reason: "Access to 'process.env' is not allowed" },
  ];

  for (const { pattern, reason } of dangerousPatterns) {
    if (pattern.test(strippedCode)) return reason;
  }
  return null;
}

export default function DynamicPost({ code }: DynamicPostProps) {
  const Component = useMemo(() => {
    try {
      // Validate code for dangerous patterns before evaluation
      const validationError = validateCode(code);
      if (validationError) {
        console.error("Code validation failed:", validationError);
        return null;
      }

      // Remove import statements and strip all 'export' keywords
      let codeWithoutImports = code
        .replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '')
        .replace(/^export\s+\{[^}]*\};?\s*$/gm, '')
        .replace(/^export\s+default\s+/gm, '')
        .replace(/^export\s+/gm, '');

      // Find the first component (function or const arrow) and alias it as __Component__
      const fnMatch = codeWithoutImports.match(/^(const|function)\s+(\w+)/m);
      if (fnMatch) {
        const name = fnMatch[2];
        codeWithoutImports += `\nconst __Component__ = ${name};`;
      }

      // Transpile JSX to JS
      const { code: jsCode } = transform(codeWithoutImports, {
        transforms: ["jsx", "typescript"],
        jsxRuntime: "classic",
        jsxPragma: "React.createElement",
        jsxFragmentPragma: "React.Fragment",
      });

      // Create a function that returns the component with all dependencies injected
      // This is safe because the code originates from our server-side AI API route
      const fn = new Function(
        "React",
        "EditableText",
        "DraggableWrapper",
        "useAspectRatio",
        "useEditMode",
        "useTheme",
        "IPhoneMockup",
        "PostHeader",
        "PostFooter",
        "FloatingCard",
        "IPadMockup",
        "DesktopMockup",
        "LucideIcons",
        `
        // Shadow dangerous globals to prevent access
        var window = undefined, document = undefined, globalThis = undefined,
            fetch = undefined, localStorage = undefined, sessionStorage = undefined,
            XMLHttpRequest = undefined, WebSocket = undefined, eval = undefined,
            process = undefined, require = undefined, importScripts = undefined;
        const { ${Object.keys(LucideIcons).join(", ")} } = LucideIcons;
        ${jsCode}
        return typeof __Component__ !== 'undefined' ? __Component__ : null;
        `
      );

      return fn(
        React,
        EditableText,
        DraggableWrapper,
        useAspectRatio,
        useEditMode,
        useTheme,
        IPhoneMockup,
        PostHeader,
        PostFooter,
        FloatingCard,
        IPadMockup,
        DesktopMockup,
        LucideIcons,
      );
    } catch (err) {
      console.error("Failed to compile dynamic post:", err);
      return null;
    }
  }, [code]);

  if (!Component) {
    return (
      <div className="relative w-full max-w-[600px] aspect-square flex items-center justify-center bg-red-50 text-red-500 p-8 text-center text-sm font-bold">
        Failed to render post. Check console for errors.
      </div>
    );
  }

  return <Component />;
}
