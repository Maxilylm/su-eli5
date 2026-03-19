"use client";

import { useState } from "react";

interface LevelData {
  explanation: string;
  wordCount: number;
  readingLevel: string;
}

interface ExplanationResult {
  eli5: LevelData;
  highSchool: LevelData;
  expert: LevelData;
}

const levels = [
  { key: "eli5" as const, emoji: "\ud83d\udc76", label: "ELI5", subtitle: "Explain Like I'm 5" },
  { key: "highSchool" as const, emoji: "\ud83c\udf93", label: "High School", subtitle: "Clear & Accessible" },
  { key: "expert" as const, emoji: "\ud83e\udde0", label: "Expert", subtitle: "Domain Knowledge" },
];

export default function Home() {
  const [text, setText] = useState("");
  const [result, setResult] = useState<ExplanationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(0);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!text.trim() || loading) return;

    setLoading(true);
    setError("");
    setResult(null);
    setActiveTab(0);

    try {
      const res = await fetch("/api/explain", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        return;
      }

      setResult(data);
    } catch {
      setError("Failed to connect. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex flex-col items-center min-h-screen px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            <span className="text-white">ELI5</span>
          </h1>
          <p className="text-zinc-400 text-lg">
            Paste complex text. Get explanations at 3 levels.
          </p>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSubmit} className="mb-8">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste complex text here — legal jargon, medical reports, technical docs, academic papers..."
            className="w-full h-40 bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-zinc-100 placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
            maxLength={10000}
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-zinc-500">
              {text.length.toLocaleString()} / 10,000 characters
            </span>
            <button
              type="submit"
              disabled={!text.trim() || loading}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium rounded-lg transition-colors cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    />
                  </svg>
                  Explaining...
                </span>
              ) : (
                "Explain"
              )}
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 mb-6 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Results */}
        {result && (
          <div>
            {/* Tabs */}
            <div className="flex gap-1 bg-zinc-900 rounded-xl p-1 mb-4">
              {levels.map((level, i) => (
                <button
                  key={level.key}
                  onClick={() => setActiveTab(i)}
                  className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    activeTab === i
                      ? "bg-zinc-700 text-white"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <span className="mr-1.5">{level.emoji}</span>
                  {level.label}
                </button>
              ))}
            </div>

            {/* Active Card */}
            {levels.map((level, i) => {
              const data = result[level.key];
              if (activeTab !== i) return null;
              return (
                <div
                  key={level.key}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <span className="text-3xl">{level.emoji}</span>
                    <div>
                      <h2 className="text-lg font-semibold text-white">
                        {level.label}
                      </h2>
                      <p className="text-xs text-zinc-500">{level.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-zinc-200 leading-relaxed whitespace-pre-wrap mb-4">
                    {data.explanation}
                  </p>
                  <div className="flex gap-4 pt-3 border-t border-zinc-800">
                    <span className="text-xs text-zinc-500">
                      {data.wordCount} words
                    </span>
                    <span className="text-xs text-zinc-500">
                      {data.readingLevel}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-auto pt-12 pb-6 text-center text-xs text-zinc-600">
        Powered by Groq &amp; Llama 3.3
      </footer>
    </main>
  );
}
