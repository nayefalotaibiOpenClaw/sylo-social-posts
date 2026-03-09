"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Id } from "@/convex/_generated/dataModel";
import { LayoutGrid, Palette } from "lucide-react";

export default function WorkspaceStats({ workspaceId }: { workspaceId: Id<"workspaces"> }) {
  const collections = useQuery(api.collections.listByWorkspace, { workspaceId });
  const branding = useQuery(api.branding.getByWorkspace, { workspaceId });

  return (
    <>
      <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
        <LayoutGrid className="w-3 h-3" />
        {collections?.length ?? 0} collection{collections?.length !== 1 ? "s" : ""}
      </span>
      {branding && (
        <span className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
          <Palette className="w-3 h-3" />
          {branding.brandName}
        </span>
      )}
    </>
  );
}
