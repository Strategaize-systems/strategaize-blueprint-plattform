"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface QuestionEvent {
  id: string;
  event_type: string;
  payload: Record<string, unknown>;
  created_at: string;
  created_by: string;
}

const EVENT_TYPE_LABELS: Record<string, string> = {
  answer_submitted: "Antwort",
  note_added: "Notiz",
  evidence_attached: "Evidence verknüpft",
  status_changed: "Status geändert",
};

const EVENT_TYPE_VARIANTS: Record<string, "default" | "secondary" | "outline"> = {
  answer_submitted: "default",
  note_added: "secondary",
  evidence_attached: "outline",
  status_changed: "outline",
};

export function EventHistory({
  runId,
  questionId,
}: {
  runId: string;
  questionId: string;
}) {
  const [events, setEvents] = useState<QuestionEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async () => {
    setLoading(true);
    try {
      // Use the tenant question events endpoint filtered by question
      const res = await fetch(
        `/api/tenant/runs/${runId}/questions/${questionId}/events`
      );
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events ?? []);
      }
    } finally {
      setLoading(false);
    }
  }, [runId, questionId]);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  if (loading) {
    return <Skeleton className="h-20 w-full" />;
  }

  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-2">
        Keine Ereignisse für diese Frage.
      </p>
    );
  }

  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="history">
        <AccordionTrigger className="text-sm">
          Verlauf ({events.length} Ereignisse)
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-md border p-2 text-sm"
              >
                <div className="flex items-center justify-between gap-2">
                  <Badge
                    variant={EVENT_TYPE_VARIANTS[event.event_type] ?? "outline"}
                    className="text-xs"
                  >
                    {EVENT_TYPE_LABELS[event.event_type] ?? event.event_type}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {new Date(event.created_at).toLocaleString("de-DE")}
                  </span>
                </div>
                {event.event_type === "answer_submitted" && typeof event.payload?.text === "string" && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-3">
                    {event.payload.text}
                  </p>
                )}
                {event.event_type === "note_added" && typeof event.payload?.text === "string" && (
                  <p className="mt-1 text-xs text-muted-foreground line-clamp-3">
                    {event.payload.text}
                  </p>
                )}
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
