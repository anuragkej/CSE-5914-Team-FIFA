import Link from "next/link";
import { notFound } from "next/navigation";
import { requestAuth } from "@/adapters/supabase";
import { loadListing, loadThreads } from "@/adapters/supabaseThreads";
import { WorkspaceFrame } from "@/app/journey/WorkspaceFrame";
import { PostForm } from "@/app/listings/PostForm";
import { authorLabel, isUuid, listingTitle } from "@/domain/threads";

function when(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/New_York" });
}

export default async function ListingThreadsPage({ params }: { params: Promise<{ listingId: string }> }) {
  const { listingId } = await params;
  if (!isUuid(listingId)) notFound();

  const [session, listing, threads] = await Promise.all([
    requestAuth().then((auth) => auth.session()),
    loadListing(listingId),
    loadThreads(listingId),
  ]);
  if (listing.kind === "ok" && listing.value === null) notFound();
  const viewerId = session?.userId ?? null;

  return (
    <WorkspaceFrame active="listings">
      <Link href="/listings" className="text-sm text-primary">
        ← All listings
      </Link>
      {listing.kind === "ok" && listing.value ? (
        <>
          <h1 className="font-heading text-4xl leading-tight">{listingTitle(listing.value)}</h1>
          {listing.value.description ? <p className="text-muted-foreground">{listing.value.description}</p> : null}
        </>
      ) : (
        <h1 className="font-heading text-4xl leading-tight">Listing discussion</h1>
      )}
      {listing.kind === "not_configured" && (
        <p className="text-muted-foreground">Discussions need the Supabase environment variables.</p>
      )}
      {listing.kind === "unavailable" && <p className="text-destructive">Could not load this listing just now.</p>}

      <section className="flex flex-col gap-3 rounded-xl border border-border bg-white p-5">
        <h2 className="text-lg font-semibold">Start a discussion</h2>
        {session ? (
          <PostForm kind="thread" listingId={listingId} />
        ) : (
          <p className="text-muted-foreground">
            <Link href="/login" className="text-primary">
              Log in
            </Link>{" "}
            or{" "}
            <Link href="/signup" className="text-primary">
              sign up
            </Link>{" "}
            to post. Anyone can read.
          </p>
        )}
      </section>

      {threads.kind === "unavailable" && <p className="text-destructive">Could not load discussions just now.</p>}
      {threads.kind === "ok" && threads.value.length === 0 && (
        <p className="text-muted-foreground">No discussions yet. Be the first to ask.</p>
      )}
      {threads.kind === "ok" && threads.value.length > 0 && (
        <ul className="flex flex-col gap-4">
          {threads.value.map((thread) => (
            <li key={thread.threadId} className="flex flex-col gap-3 rounded-xl border border-border bg-white p-5">
              <p className="text-xs text-muted-foreground">
                {authorLabel(thread.authorId, viewerId)} · {when(thread.createdAt)}
              </p>
              <p className="whitespace-pre-wrap">{thread.text}</p>
              {thread.replies.length > 0 && (
                <ul className="flex flex-col gap-2 border-l-2 border-border pl-4">
                  {thread.replies.map((reply) => (
                    <li key={reply.replyId} className="flex flex-col gap-1">
                      <p className="text-xs text-muted-foreground">
                        {authorLabel(reply.authorId, viewerId)} · {when(reply.createdAt)}
                      </p>
                      <p className="whitespace-pre-wrap">{reply.text}</p>
                    </li>
                  ))}
                </ul>
              )}
              {session ? <PostForm kind="reply" listingId={listingId} threadId={thread.threadId} /> : null}
            </li>
          ))}
        </ul>
      )}
    </WorkspaceFrame>
  );
}
