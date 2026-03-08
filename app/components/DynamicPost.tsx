"use client";

import React, { useMemo } from "react";
import { transform } from "sucrase";
import EditableText from "./EditableText";
import DraggableWrapper from "./DraggableWrapper";
import { useAspectRatio } from "./EditContext";
import { useTheme } from "./ThemeContext";
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard, IPadMockup, DesktopMockup } from "./shared";
import * as LucideIcons from "lucide-react";

interface DynamicPostProps {
  code: string;
}

// NOTE: This component intentionally uses dynamic code evaluation (new Function)
// to render AI-generated React components at runtime. The code comes from our own
// API route which calls Google Gemini - not from untrusted user input.
// This is the standard approach for live code playgrounds (like CodeSandbox, MDX, etc.)

export default function DynamicPost({ code }: DynamicPostProps) {
  const Component = useMemo(() => {
    try {
      // Remove import statements - we provide everything via scope
      const codeWithoutImports = code
        .replace(/^import\s+.*?from\s+['"].*?['"];?\s*$/gm, '')
        .replace(/^export\s+default\s+/m, 'const __Component__ = ');

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
        "useTheme",
        "IPhoneMockup",
        "PostHeader",
        "PostFooter",
        "FloatingCard",
        "IPadMockup",
        "DesktopMockup",
        "LucideIcons",
        `
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
