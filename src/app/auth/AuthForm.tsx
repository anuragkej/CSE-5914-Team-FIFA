"use client";

import { useActionState, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  PASSWORD_MIN_LENGTH,
  type ConfirmationNotice,
  type EmailProblem,
  type PasswordProblem,
} from "@/domain/auth";
import { signInAction, signUpAction, type AuthFormState } from "./actions";

type Props = { mode: "sign_in"; notice: ConfirmationNotice | null } | { mode: "sign_up" };
type Banner = { tone: "destructive" | "warning" | "info" | "success"; title: string; body: string };

const EMAIL_COPY: Record<EmailProblem, string> = {
  missing: "Enter your email.",
  malformed: "Enter a valid email address.",
  rejected: "This address can't be used. Try another.",
};

const PASSWORD_COPY: Record<PasswordProblem, string> = {
  missing: "Enter your password.",
  too_short: `Use at least ${PASSWORD_MIN_LENGTH} characters.`,
  too_weak: "Pick a stronger password.",
};

const NOTICE_BANNER: Record<ConfirmationNotice, Banner> = {
  email_confirmed: { tone: "success", title: "Email confirmed", body: "Log in to continue." },
  link_invalid: {
    tone: "warning",
    title: "That link didn't work",
    body: "The link expired or was already used.",
  },
};

export function AuthForm(props: Props) {
  const [email, setEmail] = useState("");
  const [attempt, setAttempt] = useState(0);
  const mode = props.mode;
  const submit = useCallback(async (prev: AuthFormState, formData: FormData) => {
    setEmail(String(formData.get("email") ?? ""));
    setAttempt((n) => n + 1);
    return mode === "sign_in" ? signInAction(prev, formData) : signUpAction(prev, formData);
  }, [mode]);
  const [state, formAction, pending] = useActionState<AuthFormState, FormData>(submit, null);

  useEffect(() => {
    const input = document.getElementById("email");
    if (!(input instanceof HTMLInputElement)) return;
    // React 19 clears this uncontrolled input after the action returns.
    const frame = requestAnimationFrame(() => {
      input.value = email;
    });
    return () => cancelAnimationFrame(frame);
  }, [email, attempt]);

  if (props.mode === "sign_up" && state?.kind === "confirmation_pending") {
    return (
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle>Confirm your email</CardTitle>
          <CardDescription>
            We sent a link to {state.email}. The account is not active until you open the link and then log in.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Link href="/login" className={buttonVariants({ variant: "link" })}>
            Log in
          </Link>
        </CardFooter>
      </Card>
    );
  }

  const banner = state ? bannerFor(state) : props.mode === "sign_in" && props.notice ? NOTICE_BANNER[props.notice] : null;
  const errors: { email?: EmailProblem; password?: PasswordProblem } = state?.kind === "invalid" ? state.errors : {};

  return (
    <Card className="mx-auto w-full max-w-sm">
      <form action={formAction}>
        <CardContent>
          <FieldGroup>
            <Field data-invalid={errors.email ? true : undefined}>
              <FieldLabel htmlFor="email">Email</FieldLabel>
              <Input
                key={attempt}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                defaultValue={email}
                aria-invalid={errors.email ? true : undefined}
              />
              <FieldError>{errors.email ? EMAIL_COPY[errors.email] : null}</FieldError>
            </Field>
            <Field data-invalid={errors.password ? true : undefined}>
              <FieldLabel htmlFor="password">Password</FieldLabel>
              <Input
                id="password"
                name="password"
                type="password"
                autoComplete={props.mode === "sign_in" ? "current-password" : "new-password"}
                minLength={props.mode === "sign_up" ? PASSWORD_MIN_LENGTH : undefined}
                required
                aria-invalid={errors.password ? true : undefined}
              />
              {props.mode === "sign_up" && (
                <FieldDescription>At least {PASSWORD_MIN_LENGTH} characters.</FieldDescription>
              )}
              <FieldError>{errors.password ? PASSWORD_COPY[errors.password] : null}</FieldError>
            </Field>
          </FieldGroup>
          {banner && (
            <Alert variant={banner.tone} className="mt-5">
              <AlertTitle>{banner.title}</AlertTitle>
              <AlertDescription>{banner.body}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="mt-4 justify-between">
          <Button type="submit" disabled={pending}>
            {pending && <Spinner data-icon="inline-start" />}
            {props.mode === "sign_in" ? "Log in" : "Sign up"}
          </Button>
          <Link
            href={props.mode === "sign_in" ? "/signup" : "/login"}
            className={buttonVariants({ variant: "link" })}
          >
            {props.mode === "sign_in" ? "New here? Sign up" : "Have an account? Log in"}
          </Link>
        </CardFooter>
      </form>
    </Card>
  );
}

function bannerFor(state: NonNullable<AuthFormState>): Banner | null {
  switch (state.kind) {
    case "invalid":
      return null;
    case "bad_credentials":
      return {
        tone: "destructive",
        title: "Could not log in",
        body: "That email and password do not match.",
      };
    case "confirmation_pending":
      return {
        tone: "info",
        title: "Confirm your email first",
        body: `Open the link we sent to ${state.email}.`,
      };
    case "email_taken":
      return {
        tone: "info",
        title: "Could not sign up",
        body: "An account with that email already exists. Log in.",
      };
    case "rate_limited":
      return { tone: "warning", title: "Too many attempts", body: "Wait a minute, then try again." };
    case "unavailable":
      return {
        tone: "destructive",
        title: "Accounts are unavailable",
        body: "Try again later. The analyzer works without an account.",
      };
    default: {
      const unhandled: never = state;
      return unhandled;
    }
  }
}
