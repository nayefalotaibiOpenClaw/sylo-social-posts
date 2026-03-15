# Agent Chat — Implementation Plan

## Overview

Transform the current single-prompt generation input into an agentic chat with conversation history, tool use, and multi-turn interaction. The agent can generate posts, edit specific posts, read post code, list posts, update brand theme, and adapt ratios.

## UX Design

**Same floating input bar at bottom** — no sidebar, no page changes.

- **Collapsed (default):** Exactly the current input bar
- **Expanded:** Chat messages grow upward from input (max 50vh, scrollable)
- **Toggle:** Small button to expand/collapse chat history
- **Messages:** User bubbles (right), Agent bubbles (left) with tool action indicators
- **Session-based:** Chat history lives in React state per session (no DB persistence for v1)

## Architecture

### 1. Chat Message Types

```ts
type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  toolCalls?: ToolCallResult[];  // Actions the agent took
  status?: 'thinking' | 'done' | 'error';
};

type ToolCallResult = {
  tool: string;         // 'generate_posts' | 'edit_post' | 'list_posts' | 'read_post' | 'delete_posts' | 'update_brand' | 'adapt_ratio'
  args: Record<string, unknown>;
  result?: string;      // Summary shown to user
  status: 'running' | 'done' | 'error';
};
```

### 2. Agent API Route (`/api/agent`)

- Receives: `{ message, history, context }` (context = workspace, branding, posts summary)
- Uses Gemini with function calling (tool_use)
- Tools available to the AI:
  - `generate_posts(prompt, count, style, ratio)` — calls existing generate logic
  - `edit_post(postIndex, instructions)` — AI rewrites a specific post's code
  - `list_posts()` — returns count + summaries of current posts
  - `read_post(postIndex)` — returns full TSX code of a post
  - `delete_posts(postIndices)` — marks posts for deletion
  - `update_brand(field, value)` — updates brand colors/fonts/tagline
  - `adapt_ratio(postIndices, ratios)` — adapts posts to new ratios
- Returns: SSE stream with `{ type: 'text' | 'tool_call' | 'tool_result' | 'done', data }` chunks

### 3. Client Components

- **`AgentChatPanel.tsx`** — new component wrapping the existing floating input
  - Manages chat message state
  - Renders message bubbles when expanded
  - Handles SSE streaming from `/api/agent`
  - Executes client-side actions (delete posts, update theme via mutations)
  - Collapse/expand toggle

### 4. Integration with Design Page

- Replace the inline floating chat JSX in `page.tsx` with `<AgentChatPanel />`
- Pass down: workspace, branding, posts, mutations as props
- Agent responses that modify posts/brand trigger existing Convex mutations from client

## Tools Detail

| Tool | Server or Client | How |
|------|-----------------|-----|
| `generate_posts` | Server | Calls existing engine logic, returns codes |
| `edit_post` | Server | AI rewrites TSX with instructions |
| `list_posts` | Client-provided context | Just reads from props |
| `read_post` | Client-provided context | Returns post code from props |
| `delete_posts` | Client callback | Calls `removePost` mutation |
| `update_brand` | Client callback | Calls `updateBrandingField` / `updateColors` mutation |
| `adapt_ratio` | Client callback | Calls `/api/adapt-ratio` |

## File Changes

1. **New:** `features/design-editor/components/AgentChatPanel.tsx` — main chat UI component
2. **New:** `app/api/agent/route.ts` — agent API with Gemini function calling
3. **Edit:** `app/(dashboard)/design/page.tsx` — replace inline chat with `<AgentChatPanel />`
4. **New:** `lib/ai/agent-tools.ts` — tool definitions and handlers for Gemini

## Non-Goals (v1)

- No persistent chat history in DB
- No streaming token-by-token (full response, then display)
- No image generation tools
- No multi-workspace context
