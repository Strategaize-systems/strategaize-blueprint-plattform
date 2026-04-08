"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent } from "@/components/ui/card";
import { ClipboardList, MessageSquareText } from "lucide-react";

type WorkspaceMode = "questionnaire" | "freeform";

interface ModeSelectorProps {
  onSelect: (mode: WorkspaceMode) => void;
}

export function ModeSelector({ onSelect }: ModeSelectorProps) {
  const t = useTranslations("freeform.modeSelector");

  return (
    <div className="mx-auto max-w-2xl py-12 px-4">
      <h2 className="text-2xl font-bold text-slate-900 text-center mb-8">
        {t("title")}
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Questionnaire Mode */}
        <Card
          className="group cursor-pointer border-2 border-transparent transition-all duration-200 hover:border-brand-primary hover:shadow-lg hover:scale-[1.02]"
          onClick={() => onSelect("questionnaire")}
        >
          <CardContent className="flex flex-col items-center text-center p-8 gap-4">
            <div className="rounded-2xl bg-brand-primary/10 p-4">
              <ClipboardList className="h-10 w-10 text-brand-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t("questionnaireTitle")}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {t("questionnaireDescription")}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Free-Form Mode */}
        <Card
          className="group cursor-pointer border-2 border-transparent transition-all duration-200 hover:border-brand-primary hover:shadow-lg hover:scale-[1.02]"
          onClick={() => onSelect("freeform")}
        >
          <CardContent className="flex flex-col items-center text-center p-8 gap-4">
            <div className="rounded-2xl bg-brand-primary/10 p-4">
              <MessageSquareText className="h-10 w-10 text-brand-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">
                {t("freeformTitle")}
              </h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                {t("freeformDescription")}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
