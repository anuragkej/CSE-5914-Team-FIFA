import Link from "next/link";
import { loadListings } from "@/adapters/supabaseThreads";
import { WorkspaceFrame } from "@/app/journey/WorkspaceFrame";
import { listingTitle } from "@/domain/threads";

export default async function ListingsPage() {
  const loaded = await loadListings();

  return (
    <WorkspaceFrame active="listings">
      <p className="font-mono text-xs tracking-wide text-primary">COMMUNITY</p>
      <h1 className="font-heading text-4xl leading-tight">Listing discussions</h1>
      <p className="text-lg text-muted-foreground">
        Pick a listing to read what other students say about it, or start a thread.
      </p>
      {loaded.kind === "not_configured" && (
        <p className="text-muted-foreground">
          Discussions need NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY. The analyzer still works without them.
        </p>
      )}
      {loaded.kind === "unavailable" && <p className="text-destructive">Could not load listings just now.</p>}
      {loaded.kind === "ok" && loaded.value.length === 0 && (
        <p className="rounded-xl border border-border bg-white p-5 text-muted-foreground">
          No listings yet. Once rows are added to the listings table, they show up here with their discussions.
        </p>
      )}
      {loaded.kind === "ok" && loaded.value.length > 0 && (
        <ul className="flex flex-col gap-3">
          {loaded.value.map((listing) => (
            <li key={listing.listingId}>
              <Link
                href={`/listings/${listing.listingId}`}
                className="flex flex-col gap-1 rounded-xl border border-border bg-white p-5 hover:border-primary"
              >
                <span className="text-lg font-semibold">{listingTitle(listing)}</span>
                <span className="text-sm text-muted-foreground">
                  {[
                    listing.rent !== null ? `$${listing.rent.toLocaleString("en-US")}/mo` : null,
                    listing.bedrooms !== null ? `${listing.bedrooms} bd` : null,
                    listing.bathrooms !== null ? `${listing.bathrooms} ba` : null,
                    listing.neighborhood,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </WorkspaceFrame>
  );
}
