"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Metadata } from "next";

const STEPS = [
  {
    title: "What's your role?",
    subtitle: "Help us understand how you work",
    key: "role",
    options: [
      { value: "developer", label: "Developer", emoji: "👨‍💻", desc: "I write code and build software" },
      { value: "creator", label: "Creator", emoji: "🎨", desc: "I create content and media" },
      { value: "operations", label: "Operations", emoji: "📊", desc: "I manage teams and processes" },
      { value: "general", label: "General User", emoji: "🙋", desc: "I use apps for daily tasks" },
    ],
  },
  {
    title: "What platform do you mainly use?",
    subtitle: "We'll find skills that work with your tools",
    key: "platform",
    options: [
      { value: "github", label: "GitHub", emoji: "🐙", desc: "Code hosting and collaboration" },
      { value: "slack", label: "Slack", emoji: "💬", desc: "Team messaging" },
      { value: "discord", label: "Discord", emoji: "🎮", desc: "Community and chat" },
      { value: "whatsapp", label: "WhatsApp", emoji: "📱", desc: "Messaging" },
      { value: "telegram", label: "Telegram", emoji: "✈️", desc: "Messaging and bots" },
      { value: "general", label: "Multiple / Other", emoji: "🌐", desc: "I use many platforms" },
    ],
  },
  {
    title: "What do you want to automate?",
    subtitle: "Pick your top priority",
    key: "goal",
    options: [
      { value: "code", label: "Coding", emoji: "⌨️", desc: "Code generation, review, deployment" },
      { value: "email", label: "Email", emoji: "📧", desc: "Email drafting, sorting, replies" },
      { value: "calendar", label: "Calendar", emoji: "📅", desc: "Scheduling and time management" },
      { value: "social-media", label: "Social Media", emoji: "📣", desc: "Posts, engagement, analytics" },
      { value: "data", label: "Data & Analysis", emoji: "📈", desc: "Data processing and insights" },
      { value: "security", label: "Security", emoji: "🔒", desc: "Threat detection and protection" },
    ],
  },
];

export default function QuizPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const current = STEPS[step];

  const handleSelect = async (value: string) => {
    const updated = { ...answers, [current.key]: value };
    setAnswers(updated);

    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      // Submit
      setLoading(true);
      try {
        const res = await fetch("/api/quiz", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updated),
        });
        const data = await res.json();
        if (data.id) {
          router.push(`/quiz/result/${data.id}`);
        }
      } catch (err) {
        console.error("Quiz submit failed:", err);
        setLoading(false);
      }
    }
  };

  const progress = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-hero-bg">
      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        {/* Progress bar */}
        <div className="mb-12">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-slate-400">
              Step {step + 1} of {STEPS.length}
            </span>
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="text-primary-light hover:text-white"
              >
                ← Back
              </button>
            )}
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-primary-light"
              style={{ width: `${progress}%`, transition: "width 300ms ease" }}
            />
          </div>
        </div>

        {/* Question */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-white sm:text-4xl">
            {current.title}
          </h1>
          <p className="mt-3 text-lg text-slate-400">{current.subtitle}</p>
        </div>

        {/* Options */}
        {loading ? (
          <div className="flex flex-col items-center py-20">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary-light border-t-transparent" />
            <p className="mt-4 text-lg text-slate-400">
              Finding the best skills for you...
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {current.options.map((opt) => (
              <button
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className="group flex items-start gap-4 rounded-xl border border-white/10 bg-white/5 p-5 text-left backdrop-blur-sm hover:border-primary-light/40 hover:bg-primary-light/10"
              >
                <span className="text-3xl">{opt.emoji}</span>
                <div>
                  <div className="text-base font-semibold text-white group-hover:text-primary-light">
                    {opt.label}
                  </div>
                  <div className="mt-1 text-sm text-slate-400">
                    {opt.desc}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Selected answers */}
        {Object.keys(answers).length > 0 && !loading && (
          <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
            {Object.entries(answers).map(([key, val]) => (
              <span
                key={key}
                className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-400"
              >
                {val}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
