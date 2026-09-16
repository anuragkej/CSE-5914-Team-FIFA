import { sampleDocuments } from "@/adapters/mock/sampleDocuments";
import { AnalyzerForm } from "./AnalyzerForm";

export default function Home() {
  return (
    <main className="shell">
      <header className="hero">
        <p className="eyebrow">Team FIFA · CSE 5914 · Columbus student housing</p>
        <h1>LeaseLens</h1>
        <p className="lede">
          Paste a lease or a listing. Get the true monthly cost, every fee, how it compares to nearby units, whether
          the landlord actually owns the place, and anything Ohio law says should not be in there.
        </p>
      </header>
      <AnalyzerForm samples={sampleDocuments} />
      <footer className="foot">
        Prototype running on fixture data. Market comps are synthetic, FMR is HUD FY2026, parcel records are shaped
        like the Franklin County Auditor export. Not legal advice.
      </footer>
    </main>
  );
}
