"use client";

import { useState, useMemo } from "react";
import { PageWrapper } from "@/components/layout/PageWrapper";
import { PageHeader } from "@/components/layout/PageHeader";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResultCard, SearchResultItem } from "@/components/search/SearchResultCard";
import { allExercises, donts } from "@/data";
import { useExerciseStore } from "@/store";
import { getTodayKey } from "@/lib/dateUtils";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const logs = useExerciseStore((s) => s.logs);
  const toggle = useExerciseStore((s) => s.toggle);

  const todayKey = useMemo(() => getTodayKey(), []);
  const todayLogs = logs[todayKey] ?? {};

  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const exerciseResults: SearchResultItem[] = allExercises
      .filter((ex) => {
        const nameMatch = ex.name.toLowerCase().includes(q);
        const noteMatch = ex.note.toLowerCase().includes(q);
        const detailMatch = "detail" in ex ? ex.detail.toLowerCase().includes(q) : false;
        return nameMatch || noteMatch || detailMatch;
      })
      .map((ex) => {
        // Check if there is a matching don't item warning
        const matchingDont = donts.find(
          (d) =>
            ex.name.toLowerCase().includes(d.name.toLowerCase()) ||
            d.name.toLowerCase().includes(ex.name.toLowerCase())
        );

        return {
          type: "exercise" as const,
          exercise: ex,
          isCompleted: !!todayLogs[ex.id],
          warning: matchingDont ? `Contraindicated warning: ${matchingDont.reason}` : undefined,
        };
      });

    const dontResults: SearchResultItem[] = donts
      .filter((d) => {
        const nameMatch = d.name.toLowerCase().includes(q);
        const reasonMatch = d.reason.toLowerCase().includes(q);
        return nameMatch || reasonMatch;
      })
      .map((d) => ({
        type: "dont" as const,
        dont: d,
      }));

    return [...dontResults, ...exerciseResults];
  }, [query, todayLogs]);

  return (
    <PageWrapper>
      <PageHeader
        title="Search & Safety"
        subtitle="Search routine exercises or safety rules"
        showSearch={false}
      />

      <SearchBar value={query} onChange={setQuery} />

      {!query.trim() && (
        <div className="text-center py-12 px-4 bg-gray-900/50 rounded-2xl border border-gray-800/60">
          <div className="text-3xl mb-2">🔍</div>
          <h3 className="text-sm font-semibold text-gray-300">Type to search exercises or safety rules</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
            Search by exercise name, body part, condition, or contraindicated movements.
          </p>
        </div>
      )}

      {query.trim() && searchResults.length === 0 && (
        <div className="text-center py-12 px-4 bg-gray-900/50 rounded-2xl border border-gray-800/60">
          <div className="text-3xl mb-2">🚫</div>
          <h3 className="text-sm font-semibold text-gray-300">No matching results found</h3>
          <p className="text-xs text-gray-400 mt-1">
            Try searching for terms like "bench", "neck", "deadlift", "squat", or "chin tuck".
          </p>
        </div>
      )}

      {searchResults.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Found {searchResults.length} {searchResults.length === 1 ? "result" : "results"}
          </div>
          {searchResults.map((item, index) => {
            const key = item.type === "exercise" ? item.exercise.id : item.dont.id;
            return (
              <SearchResultCard
                key={`${key}-${index}`}
                item={item}
                onToggleExercise={(id) => toggle(id, todayKey)}
              />
            );
          })}
        </div>
      )}
    </PageWrapper>
  );
}
