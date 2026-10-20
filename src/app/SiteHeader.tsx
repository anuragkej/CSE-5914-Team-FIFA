import Link from "next/link";
import { requestAuth } from "@/adapters/supabase";
import { Button, buttonVariants } from "@/components/ui/button";
import { signOutAction } from "./auth/actions";

export async function SiteHeader() {
  const session = await (await requestAuth()).session();

  return (
    <header className="mx-auto flex w-full max-w-3xl items-end justify-between gap-4 px-4 pt-10 sm:px-6">
      <div className="flex flex-col gap-3">
        <p className="text-xs font-medium tracking-[0.06em] text-muted-foreground">
          Team FIFA · CSE 5914 · Columbus student housing
        </p>
        <Link href="/" className="font-heading text-[2rem] leading-10 font-normal tracking-tight">
          LeaseLens
        </Link>
      </div>
      <nav aria-label="Account" className="flex items-center gap-2">
        {session ? (
          <>
            <span className="text-sm text-muted-foreground">{session.email}</span>
            <form action={signOutAction}>
              <Button type="submit" variant="ghost" size="sm">
                Log out
              </Button>
            </form>
          </>
        ) : (
          <>
            <Link href="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
              Log in
            </Link>
            <Link href="/signup" className={buttonVariants({ size: "sm" })}>
              Sign up
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}
