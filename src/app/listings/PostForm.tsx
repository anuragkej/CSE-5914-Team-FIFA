"use client";

import { useActionState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { POST_TEXT_MAX } from "@/domain/threads";
import { postReplyAction, postThreadAction, type PostFormState } from "./actions";

type Props =
  | { kind: "thread"; listingId: string }
  | { kind: "reply"; listingId: string; threadId: string };

function message(state: PostFormState): { tone: "error" | "ok"; text: string; signIn?: boolean } | null {
  if (!state) return null;
  switch (state.kind) {
    case "posted":
      return { tone: "ok", text: "Posted." };
    case "signed_out":
      return { tone: "error", text: "Log in to post.", signIn: true };
    case "invalid":
      if (state.problem === "missing") return { tone: "error", text: "Write something first." };
      if (state.problem === "too_long") return { tone: "error", text: `Keep it under ${POST_TEXT_MAX} characters.` };
      return { tone: "error", text: "That listing or thread could not be found." };
    case "not_configured":
      return { tone: "error", text: "Discussions need the Supabase environment variables." };
    case "unavailable":
      return { tone: "error", text: "Could not post just now. Try again." };
    default: {
      const unreachable: never = state;
      return unreachable;
    }
  }
}

export function PostForm(props: Props) {
  const action = props.kind === "thread" ? postThreadAction : postReplyAction;
  const [state, formAction, pending] = useActionState<PostFormState, FormData>(action, null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.kind === "posted") formRef.current?.reset();
  }, [state]);

  const note = message(state);
  const fieldId = props.kind === "thread" ? `thread-${props.listingId}` : `reply-${props.threadId}`;

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="listingId" value={props.listingId} />
      {props.kind === "reply" ? <input type="hidden" name="threadId" value={props.threadId} /> : null}
      <label htmlFor={fieldId} className="sr-only">
        {props.kind === "thread" ? "Start a discussion" : "Reply"}
      </label>
      <Textarea
        id={fieldId}
        name="text"
        required
        maxLength={POST_TEXT_MAX}
        placeholder={props.kind === "thread" ? "Ask other students about this place…" : "Write a reply…"}
        className="bg-white"
      />
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Posting…" : props.kind === "thread" ? "Post thread" : "Reply"}
        </Button>
        {note ? (
          <p role="status" className={note.tone === "error" ? "text-sm text-destructive" : "text-sm text-success"}>
            {note.text}{" "}
            {note.signIn ? (
              <Link href="/login" className="text-primary underline">
                Log in
              </Link>
            ) : null}
          </p>
        ) : null}
      </div>
    </form>
  );
}
