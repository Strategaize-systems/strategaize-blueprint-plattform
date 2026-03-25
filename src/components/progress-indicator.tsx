"use client";

import { Progress } from "@/components/ui/progress";

export function ProgressIndicator({
  answered,
  total,
  className,
}: {
  answered: number;
  total: number;
  className?: string;
}) {
  const progress = total > 0 ? Math.round((answered / total) * 100) : 0;

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-sm mb-1">
        <span>
          {answered} / {total} Fragen beantwortet
        </span>
        <span className="font-medium">{progress}%</span>
      </div>
      <Progress value={progress} />
    </div>
  );
}
