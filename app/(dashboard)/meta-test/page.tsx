"use client";

import { useConvexAuth, useQuery } from "convex/react";
import { useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useState } from "react";
import { Id } from "@/convex/_generated/dataModel";
import { Loader2, CheckCircle, XCircle, Play } from "lucide-react";

interface TestResult {
  permission: string;
  status: "success" | "error";
  data?: unknown;
  error?: string;
}

export default function MetaTestPage() {
  const { isAuthenticated, isLoading: authLoading } = useConvexAuth();
  const user = useQuery(api.users.currentUser);
  const workspaces = useQuery(
    api.workspaces.listByUser,
    user ? {} : "skip"
  );
  const runTests = useAction(api.metaApiTest.runAllTests);

  const [selectedWorkspace, setSelectedWorkspace] = useState<Id<"workspaces"> | null>(null);
  const [results, setResults] = useState<TestResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (authLoading) return <div className="flex items-center justify-center min-h-screen"><Loader2 className="animate-spin" size={32} /></div>;
  if (!isAuthenticated) return <div className="flex items-center justify-center min-h-screen text-white">Please log in first</div>;

  const handleRunTests = async () => {
    if (!selectedWorkspace) return;
    setLoading(true);
    setError(null);
    setResults([]);
    try {
      const res = await runTests({ workspaceId: selectedWorkspace });
      setResults(res);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const successCount = results.filter((r) => r.status === "success").length;
  const errorCount = results.filter((r) => r.status === "error").length;

  return (
    <div className="min-h-screen bg-black text-white p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">Meta API Permission Tests</h1>
      <p className="text-zinc-400 mb-8">
        Run all required API test calls for Meta App Review. Uses your connected social accounts&apos; tokens.
      </p>

      {/* Workspace Selector */}
      <div className="mb-6">
        <label className="block text-sm text-zinc-400 mb-2">Select workspace with connected accounts:</label>
        <select
          className="bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 w-full max-w-md text-white"
          value={selectedWorkspace || ""}
          onChange={(e) => setSelectedWorkspace(e.target.value as Id<"workspaces">)}
        >
          <option value="">Select a workspace...</option>
          {workspaces?.map((w) => (
            <option key={w._id} value={w._id}>
              {w.name}
            </option>
          ))}
        </select>
      </div>

      {/* Run Button */}
      <button
        onClick={handleRunTests}
        disabled={!selectedWorkspace || loading}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-zinc-700 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-lg transition-colors mb-8"
      >
        {loading ? <Loader2 className="animate-spin" size={20} /> : <Play size={20} />}
        {loading ? "Running tests..." : "Run All API Tests"}
      </button>

      {/* Error */}
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Summary */}
      {results.length > 0 && (
        <div className="flex gap-4 mb-6">
          <div className="bg-green-900/30 border border-green-700 rounded-lg px-4 py-2">
            <span className="text-green-400 font-semibold">{successCount} passed</span>
          </div>
          <div className="bg-red-900/30 border border-red-700 rounded-lg px-4 py-2">
            <span className="text-red-400 font-semibold">{errorCount} failed</span>
          </div>
        </div>
      )}

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((r, i) => (
            <div
              key={i}
              className={`border rounded-lg p-4 ${
                r.status === "success"
                  ? "border-green-700 bg-green-900/10"
                  : "border-red-700 bg-red-900/10"
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                {r.status === "success" ? (
                  <CheckCircle className="text-green-400 shrink-0" size={20} />
                ) : (
                  <XCircle className="text-red-400 shrink-0" size={20} />
                )}
                <span className="font-mono font-semibold">{r.permission}</span>
                <span
                  className={`text-xs px-2 py-0.5 rounded ${
                    r.status === "success" ? "bg-green-800 text-green-300" : "bg-red-800 text-red-300"
                  }`}
                >
                  {r.status}
                </span>
              </div>
              {r.error && <p className="text-red-400 text-sm ml-8">{r.error}</p>}
              {r.data != null && (
                <pre className="text-xs text-zinc-400 ml-8 mt-2 overflow-x-auto max-h-40 overflow-y-auto bg-zinc-900 rounded p-2">
                  {JSON.stringify(r.data, null, 2) as string}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="text-zinc-600 text-sm mt-8">
        Delete this page and convex/metaApiTest.ts after App Review is approved.
      </p>
    </div>
  );
}
