"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type CopyStatus = "idle" | "copied" | "failed";

const COPY_LABELS: Record<CopyStatus, string> = {
  idle: "Copy",
  copied: "Copied",
  failed: "Copy failed",
};

export function asMessage(questions: string[]): string {
  return ["Before I sign, could you answer a few questions?", "", ...questions.map((q, i) => `${i + 1}. ${q}`)].join("\n");
}

export function QuestionsCard({ questions }: { questions: string[] }) {
  const [status, setStatus] = useState<CopyStatus>("idle");

  async function copy() {
    try {
      await navigator.clipboard.writeText(asMessage(questions));
      setStatus("copied");
    } catch {
      setStatus("failed");
    }
    setTimeout(() => setStatus("idle"), 2000);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Questions to ask before you sign</CardTitle>
        <CardDescription>Send these to the landlord. Get the answers in writing.</CardDescription>
        <CardAction>
          <Button variant="outline" size="sm" onClick={copy} aria-live="polite">
            {status === "copied" ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
            {COPY_LABELS[status]}
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>
        <ol className="flex list-decimal flex-col gap-2 pl-5">
          {questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      </CardContent>
    </Card>
  );
}
