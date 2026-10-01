import { sampleDocuments } from "@/adapters/mock/sampleDocuments";
import { AnalyzerForm } from "./AnalyzerForm";

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <header className="flex flex-col gap-3">
        <p className="text-xs font-medium tracking-[0.06em] text-muted-foreground">
          Team FIFA · CSE 5914 · Columbus student housing
        </p>
        <h1 className="font-heading text-[2rem] leading-10 font-normal tracking-tight">LeaseLens</h1>
        <p className="text-base text-muted-foreground">
          Paste a lease or a listing. Get the true monthly cost, every fee, how it compares to nearby units, whether
          the landlord owns the place, and anything Ohio law says should not be in there.
        </p>
      </header>
      <AnalyzerForm samples={sampleDocuments} />
      <footer className="text-xs text-muted-foreground">
        Prototype on fixture data. Market comps are synthetic, FMR is HUD FY2026, parcel records are shaped like the
        Franklin County Auditor export. Not legal advice.
      </footer>
    </main>
  );
}
