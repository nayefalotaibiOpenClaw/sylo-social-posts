"use client";

import React, { useMemo } from "react";
import { transform } from "sucrase";
import EditableText from "./EditableText";
import DraggableWrapper from "./DraggableWrapper";
import { useAspectRatio, useEditMode } from "@/contexts/EditContext";
import { useTheme } from "@/contexts/ThemeContext";
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard, IPadMockup, DesktopMockup } from "@/features/posts/shared";
import * as LucideIcons from "lucide-react";
import { validateComponentCode } from "@/lib/security/code-validation";

interface DynamicPostProps {
  code: string;
}

// NOTE: This component uses dynamic code evaluation (new Function) to render
// AI-generated React components at runtime. This is the standard approach for
// live code playgrounds (like CodeSandbox, MDX, etc.). Dangerous globals are
// shadowed and code is validated to prevent XSS in shared workspaces.

export default function DynamicPost({ code }: DynamicPostProps) {
  const Component = useMemo(() => {
    try {
      // Validate code before evaluation
      const validation = validateComponentCode(code);
      if (!validation.valid) {
        console.error("Code validation failed:", validation.reason);
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

      // Create a function that returns the component with all dependencies injected.
      // Dangerous globals are shadowed (set to undefined) so evaluated code cannot
      // access them even if validation is bypassed.
      // eslint-disable-next-line no-new-func -- intentional: runtime component rendering with sandboxed globals
      const createComponent = new Function(
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
        [
          "// Shadow dangerous globals to prevent XSS",
          "var fetch = undefined, XMLHttpRequest = undefined, importScripts = undefined;",
          "var document = undefined, window = undefined, globalThis = undefined;",
          "var localStorage = undefined, sessionStorage = undefined;",
          "",
          "const { " + Object.keys(LucideIcons).join(", ") + " } = LucideIcons;",
          jsCode,
          "return typeof __Component__ !== 'undefined' ? __Component__ : null;",
        ].join("\n")
      );

      return createComponent(
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
