import type { Analysis, Cadence, Cents, MarketVerdict, OwnershipStatus } from "@/domain/types";

const usd = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });

function money(cents: Cents | null): string {
  return cents === null ? "—" : usd.format(cents / 100);
}

function signedPct(value: number | null): string {
  if (value === null) return "—";
  const pct = Math.round(value * 100);
  return `${pct > 0 ? "+" : ""}${pct}%`;
}

function cadenceLabel(cadence: Cadence): string {
  switch (cadence) {
    case "monthly":
      return "per month";
    case "annual":
      return "per year";
    case "one_time":
      return "one time";
    default: {
      const exhaustive: never = cadence;
      return exhaustive;
    }
  }
}

function verdictLabel(verdict: MarketVerdict): string {
  switch (verdict) {
    case "below_market":
      return "Below market";
    case "at_market":
      return "At market";
    case "above_market":
      return "Above market";
    case "unknown":
      return "Not enough data";
    default: {
      const exhaustive: never = verdict;
      return exhaustive;
    }
  }
}

function ownershipLabel(status: OwnershipStatus): string {
  switch (status) {
    case "match":
      return "Owner verified";
    case "mismatch":
      return "Owner mismatch";
    case "no_record":
      return "No county record";
    case "not_checked":
      return "Not checked";
    default: {
      const exhaustive: never = status;
      return exhaustive;
    }
  }
}

export function Report({ analysis }: { analysis: Analysis }) {
  const { terms, cost, market, ownership, flags } = analysis;
  const dangers = flags.filter((f) => f.severity === "danger").length;

  return (
    <section className="report" aria-live="polite">
      <div className="summary">
        <div className="card stat">
          <span className="label">True monthly cost</span>
          <strong>{money(cost?.trueMonthlyCost ?? null)}</strong>
          <span className="sub">
            {cost ? `${money(cost.rent)} rent + ${money(cost.trueMonthlyCost - cost.rent)} in fees` : "rent not found"}
          </span>
        </div>
        <div className="card stat">
          <span className="label">Cash due at move-in</span>
          <strong>{money(cost?.moveInCash ?? null)}</strong>
          <span className="sub">first month + deposit + one-time fees</span>
        </div>
        <div className={`card stat verdict-${market.verdict}`}>
          <span className="label">Versus comparable units</span>
          <strong>{signedPct(market.compDeltaPct ?? market.fmrDeltaPct)}</strong>
          <span className="sub">{verdictLabel(market.verdict)}</span>
        </div>
        <div className={`card stat own-${ownership.status}`}>
          <span className="label">Ownership check</span>
          <strong>{ownershipLabel(ownership.status)}</strong>
          <span className="sub">{dangers > 0 ? `${dangers} serious flag${dangers > 1 ? "s" : ""}` : "no serious flags"}</span>
        </div>
      </div>

      <div className="card">
        <h2>Flags ({flags.length})</h2>
        {flags.length === 0 && <p className="muted">Nothing unusual found in the text.</p>}
        <ul className="flags">
          {flags.map((f) => (
            <li key={f.code} className={`flag flag-${f.severity}`}>
              <div className="flag-head">
                <span className="badge">{f.severity}</span>
                <strong>{f.title}</strong>
                {f.basis && <span className="basis">{f.basis}</span>}
              </div>
              <p>{f.detail}</p>
              {f.excerpt && <blockquote>{f.excerpt}</blockquote>}
            </li>
          ))}
        </ul>
      </div>

      <div className="two-col">
        <div className="card">
          <h2>What we read</h2>
          <dl className="terms">
            <dt>Address</dt>
            <dd>{terms.address ?? "—"}</dd>
            <dt>Bedrooms</dt>
            <dd>{terms.bedrooms ?? "—"}</dd>
            <dt>Landlord</dt>
            <dd>{terms.landlordName ?? "—"}</dd>
            <dt>Monthly rent</dt>
            <dd>{money(terms.monthlyRent)}</dd>
            <dt>Security deposit</dt>
            <dd>{money(terms.securityDeposit)}</dd>
            <dt>Term</dt>
            <dd>{terms.leaseTermMonths ? `${terms.leaseTermMonths} months` : "—"}</dd>
          </dl>
          <h3>Fees</h3>
          {terms.fees.length === 0 ? (
            <p className="muted">No fees beyond rent were found.</p>
          ) : (
            <table>
              <tbody>
                {terms.fees.map((fee, i) => (
                  <tr key={i}>
                    <td>{fee.label}</td>
                    <td className="num">{money(fee.amount)}</td>
                    <td className="muted">{cadenceLabel(fee.cadence)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <h2>Market</h2>
          <dl className="terms">
            <dt>HUD Fair Market Rent</dt>
            <dd>
              {money(market.fmr)} <span className="muted">({signedPct(market.fmrDeltaPct)})</span>
            </dd>
            <dt>Median of comps</dt>
            <dd>
              {money(market.compMedian)} <span className="muted">({signedPct(market.compDeltaPct)})</span>
            </dd>
          </dl>
          {market.comps.length > 0 && (
            <table>
              <tbody>
                {market.comps.map((c) => (
                  <tr key={c.id}>
                    <td>
                      {c.address} <span className="muted">· {c.neighborhood}</span>
                    </td>
                    <td className="muted">
                      {c.bedrooms}bd/{c.bathrooms}ba
                    </td>
                    <td className="num">{money(c.rent)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <h3>County record</h3>
          {ownership.record ? (
            <dl className="terms">
              <dt>Parcel</dt>
              <dd>{ownership.record.parcelId}</dd>
              <dt>Owner</dt>
              <dd>{ownership.record.ownerName}</dd>
              <dt>Last transfer</dt>
              <dd>{ownership.record.lastTransferDate}</dd>
            </dl>
          ) : (
            <p className="muted">{ownership.detail}</p>
          )}
        </div>
      </div>
    </section>
  );
}
