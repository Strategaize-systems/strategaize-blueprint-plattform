"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MessageSquareText } from "lucide-react";

interface OverviewQuestion {
  id: string;
  frage_id: string;
  block: string;
  unterbereich: string;
  fragetext: string;
  latest_answer: string | null;
}

interface QuestionOverviewProps {
  questions: OverviewQuestion[];
  onStartChat: () => void;
  onBack: () => void;
}

export function QuestionOverview({ questions, onStartChat, onBack }: QuestionOverviewProps) {
  const t = useTranslations("freeform.overview");
  const tBlocks = useTranslations("blocks");

  const answered = questions.filter((q) => q.latest_answer).length;
  const total = questions.length;

  // Group by block
  const blocks = Array.from(new Set(questions.map((q) => q.block))).sort();
  const questionsByBlock = new Map<string, OverviewQuestion[]>();
  blocks.forEach((b) => {
    questionsByBlock.set(b, questions.filter((q) => q.block === b));
  });

  return (
    <div className="mx-auto max-w-3xl py-8 px-4">
      {/* Back button */}
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 transition-colors mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToMode")}
      </button>

      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">{t("title")}</h2>
        <p className="text-sm text-slate-500 mb-4">{t("subtitle")}</p>

        {/* Overall progress */}
        <div className="inline-flex items-center gap-3 rounded-full bg-slate-100 px-5 py-2.5">
          <div className="h-2.5 w-2.5 rounded-full bg-brand-success" />
          <span className="text-sm font-semibold text-slate-700">
            {t("progress", { answered, total })}
          </span>
          <div className="h-4 w-px bg-slate-300" />
          <span className="text-sm font-bold text-slate-900 tabular-nums">
            {total > 0 ? Math.round((answered / total) * 100) : 0}%
          </span>
        </div>
      </div>

      {/* Block cards */}
      <div className="space-y-4 mb-8">
        {blocks.map((block) => {
          const blockQuestions = questionsByBlock.get(block) ?? [];
          const blockAnswered = blockQuestions.filter((q) => q.latest_answer).length;
          const blockTotal = blockQuestions.length;
          const blockPercent = blockTotal > 0 ? Math.round((blockAnswered / blockTotal) * 100) : 0;

          return (
            <Card key={block} className="overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-slate-900">
                    Block {block}: {tBlocks(block)}
                  </CardTitle>
                  <span className="text-xs font-semibold text-slate-500 tabular-nums">
                    {blockAnswered}/{blockTotal}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden mt-2">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-brand-success-dark to-brand-success transition-all duration-500"
                    style={{ width: `${blockPercent}%` }}
                  />
                </div>
              </CardHeader>
              <CardContent className="pt-0 pb-4">
                {/* Question dots */}
                <div className="flex flex-wrap gap-1.5">
                  {blockQuestions.map((q) => (
                    <div
                      key={q.id}
                      className={`h-2.5 w-2.5 rounded-full transition-colors ${
                        q.latest_answer
                          ? "bg-brand-success shadow-[0_0_4px_rgba(0,168,79,0.4)]"
                          : "bg-slate-200"
                      }`}
                      title={`${q.frage_id}: ${q.fragetext} — ${q.latest_answer ? t("answered") : t("open")}`}
                    />
                  ))}
                </div>
                {/* Topics */}
                <div className="mt-3 flex flex-wrap gap-2">
                  {Array.from(new Set(blockQuestions.map((q) => q.unterbereich))).map((topic) => (
                    <span
                      key={topic}
                      className="inline-block rounded-md bg-slate-50 px-2.5 py-1 text-[11px] font-medium text-slate-500"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CTA Button */}
      <div className="text-center">
        <Button
          onClick={onStartChat}
          size="lg"
          className="bg-gradient-to-r from-brand-primary to-brand-primary-dark text-white shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all px-8 py-3 text-base font-bold"
        >
          <MessageSquareText className="mr-2 h-5 w-5" />
          {t("startChat")}
        </Button>
      </div>
    </div>
  );
}
