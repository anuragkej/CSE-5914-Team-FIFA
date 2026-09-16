"use client";

import { useActionState, useState } from "react";
import type { SampleDocument } from "@/adapters/mock/sampleDocuments";
import { analyzeAction, type AnalyzeState } from "./actions";
import { Report } from "./Report";

export function AnalyzerForm({ samples }: { samples: SampleDocument[] }) {
  const [state, formAction, pending] = useActionState<AnalyzeState, FormData>(analyzeAction, null);
  const [text, setText] = useState(samples[0]?.text ?? "");

  return (
    <>
      <form action={formAction} className="card form">
        <div className="samples">
          <span>Try a sample:</span>
          {samples.map((s) => (
            <button key={s.id} type="button" className="chip" onClick={() => setText(s.text)}>
              {s.title}
            </button>
          ))}
        </div>
        <label>
          Lease or listing text
          <textarea name="text" rows={14} value={text} onChange={(e) => setText(e.target.value)} required />
        </label>
        <div className="row">
          <label>
            Address (optional override)
            <input name="address" placeholder="Detected from text if blank" />
          </label>
          <label>
            Bedrooms
            <input name="bedrooms" type="number" min={0} max={6} placeholder="auto" />
          </label>
          <label>
            Landlord name
            <input name="landlordName" placeholder="Detected from text if blank" />
          </label>
        </div>
        <button type="submit" className="primary" disabled={pending}>
          {pending ? "Analyzing…" : "Analyze"}
        </button>
        {state?.error && <p className="error">{state.error}</p>}
      </form>
      {state?.analysis && <Report analysis={state.analysis} />}
    </>
  );
}
