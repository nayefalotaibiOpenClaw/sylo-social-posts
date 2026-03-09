"use client";

import React, { useMemo } from "react";
import { transform } from "sucrase";
import EditableText from "./EditableText";
import DraggableWrapper from "./DraggableWrapper";
import { useAspectRatio, useEditMode } from "./EditContext";
import { useTheme } from "./ThemeContext";
import { IPhoneMockup, PostHeader, PostFooter, FloatingCard, IPadMockup, DesktopMockup } from "./shared";
import * as LucideIcons from "lucide-react";
import { OverrideProvider, PostConfigOverrides } from "./OverrideContext";
import { SelectedElementProvider } from "./SelectedElementContext";
import ContextualToolbar from "./ContextualToolbar";

interface DynamicPostProps {
  code: string;
  overrides?: PostConfigOverrides;
  onOverridesChange?: (overrides: PostConfigOverrides) => void;
}

// NOTE: This component intentionally uses dynamic code evaluation (new Function)
// to render AI-generated React components at runtime. The code comes from our own
// API route which calls Google Gemini - not from untrusted user input.
// This is the standard approach for live code playgrounds (like CodeSandbox, MDX, etc.)

export default function DynamicPost({ code, overrides, onOverridesChange }: DynamicPostProps) {
  const Component = useMemo(() => {
    try {
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
        `
        const { ${Object.keys(LucideIcons).join(", ")} } = LucideIcons;
        ${jsCode}
        return typeof __Component__ !== 'undefined' ? __Component__ : null;
        `
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

  // Wrap with editing providers when post is selected (onOverridesChange provided)
  // Overrides provide instant visual feedback; baked into code on deselect
  if (overrides && onOverridesChange) {
    return (
      <OverrideProvider overrides={overrides} onChange={onOverridesChange}>
        <SelectedElementProvider>
          <Component />
          <ContextualToolbar />
        </SelectedElementProvider>
      </OverrideProvider>
    );
  }

  // Read-only overrides: keep styles visible until Convex code updates (prevents flash)
  if (overrides && overrides.elements && Object.keys(overrides.elements).length > 0) {
    return (
      <OverrideProvider overrides={overrides} onChange={() => {}}>
        <Component />
      </OverrideProvider>
    );
  }

  return <Component />;
}
