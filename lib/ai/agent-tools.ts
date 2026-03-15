import { SchemaType, type FunctionDeclaration, type Schema } from "@google/generative-ai";

/**
 * Agent tool declarations for Gemini function calling.
 * These define what actions the AI agent can take during a conversation.
 */

export const AGENT_TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: "generate_posts",
    description:
      "Generate new social media post designs. Use this when the user asks to create, generate, or make new posts. Returns the generated post codes that will be saved automatically.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        prompt: {
          type: SchemaType.STRING,
          description:
            "The creative prompt describing what posts to generate. Include style, content, mood, and any specific requirements from the user.",
        },
        count: {
          type: SchemaType.NUMBER,
          description: "Number of posts to generate (1-8). Default 2.",
        },
        style: {
          type: SchemaType.STRING,
          format: "enum",
          description:
            "Generation engine to use: 'classic' (v5, production-proven), 'wild' (v4, creative freedom), 'guided' (v7, template-based). Default 'guided'.",
          enum: ["classic", "wild", "guided"],
        } as Schema,
      },
      required: ["prompt"],
    },
  },
  {
    name: "edit_post",
    description:
      "Edit a specific existing post based on user instructions. Use this when the user wants to change, modify, update, or fix a specific post. The post will be rewritten by AI based on the instructions while keeping the same general structure.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        postIndex: {
          type: SchemaType.NUMBER,
          description:
            "The 1-based index of the post to edit (e.g., 1 for the first post, 2 for the second). Posts are ordered as displayed in the grid.",
        },
        instructions: {
          type: SchemaType.STRING,
          description:
            "What to change about the post. Be specific about what text, layout, colors, or structure to modify.",
        },
      },
      required: ["postIndex", "instructions"],
    },
  },
  {
    name: "list_posts",
    description:
      "List all current posts with their index numbers and a brief summary. Use this to understand what posts exist before editing or deleting.",
  },
  {
    name: "list_assets",
    description:
      "List all workspace assets (images, screenshots, logos, backgrounds, products) with their URLs. Use this BEFORE editing a post's background or images — you MUST use real asset URLs from this list, never make up URLs. Returns type, label, description, and full URL for each asset.",
  },
  {
    name: "read_post",
    description:
      "Read the full TSX component code of a specific post. Use this when you need to understand a post's exact content, structure, or layout before editing it.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        postIndex: {
          type: SchemaType.NUMBER,
          description: "The 1-based index of the post to read.",
        },
      },
      required: ["postIndex"],
    },
  },
  {
    name: "delete_posts",
    description:
      "Delete one or more posts. Use this when the user wants to remove specific posts.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        postIndices: {
          type: SchemaType.ARRAY,
          description:
            "Array of 1-based post indices to delete (e.g., [1, 3] to delete posts 1 and 3).",
          items: { type: SchemaType.NUMBER },
        },
      },
      required: ["postIndices"],
    },
  },
  {
    name: "update_brand",
    description:
      "Update the brand theme kit — colors, fonts, tagline, or brand name. Changes apply to all posts via the theme system. Use this when the user wants to change the overall look/feel, color palette, or typography.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        colors: {
          type: SchemaType.OBJECT,
          description:
            "Color palette to update. All values are hex color strings. Only include colors you want to change.",
          properties: {
            primary: {
              type: SchemaType.STRING,
              description: "Main brand color (e.g., '#1B4332')",
            },
            primaryLight: {
              type: SchemaType.STRING,
              description: "Light variant of primary (e.g., '#EAF4EE')",
            },
            primaryDark: {
              type: SchemaType.STRING,
              description: "Dark variant of primary (e.g., '#0D241C')",
            },
            accent: {
              type: SchemaType.STRING,
              description: "Accent color (e.g., '#40916C')",
            },
            accentLight: {
              type: SchemaType.STRING,
              description: "Light accent (e.g., '#52B788')",
            },
            accentLime: {
              type: SchemaType.STRING,
              description: "Lime accent for highlights (e.g., '#B7FF5B')",
            },
            accentGold: {
              type: SchemaType.STRING,
              description: "Gold accent (e.g., '#FCD34D')",
            },
            accentOrange: {
              type: SchemaType.STRING,
              description: "Orange accent (e.g., '#F4A261')",
            },
            border: {
              type: SchemaType.STRING,
              description: "Border color (e.g., '#254d3c')",
            },
          },
        },
        fonts: {
          type: SchemaType.OBJECT,
          description: "Font family settings. Only include fonts you want to change.",
          properties: {
            heading: {
              type: SchemaType.STRING,
              description:
                "Heading font family (e.g., 'Cairo', 'Inter', 'Poppins')",
            },
            body: {
              type: SchemaType.STRING,
              description:
                "Body font family (e.g., 'Cairo', 'Inter', 'Poppins')",
            },
          },
        },
        brandName: {
          type: SchemaType.STRING,
          description: "The brand name displayed in posts",
        },
        tagline: {
          type: SchemaType.STRING,
          description: "The brand tagline/slogan",
        },
      },
    },
  },
  {
    name: "adapt_ratio",
    description:
      "Adapt posts to different aspect ratios. Use when the user wants posts in different sizes (e.g., story format, landscape).",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        postIndices: {
          type: SchemaType.ARRAY,
          description: "Array of 1-based post indices to adapt.",
          items: { type: SchemaType.NUMBER },
        },
        ratios: {
          type: SchemaType.ARRAY,
          description:
            "Target aspect ratios to adapt to (e.g., ['9:16', '4:3']).",
          items: {
            type: SchemaType.STRING,
            format: "enum",
            enum: ["1:1", "9:16", "3:4", "4:3", "16:9"],
          } as Schema,
        },
      },
      required: ["postIndices", "ratios"],
    },
  },
];

/** Map style string to engine version number */
export function styleToVersion(style?: string): 4 | 5 | 7 {
  switch (style) {
    case "wild":
      return 4;
    case "classic":
      return 5;
    case "guided":
    default:
      return 7;
  }
}
