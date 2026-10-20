import { redirect } from "next/navigation";
import { requestAuth } from "@/adapters/supabase";
import { confirmationNotice } from "@/domain/auth";
import { AuthForm } from "../auth/AuthForm";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (await (await requestAuth()).session()) redirect("/");
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 pt-8 pb-10 sm:px-6">
      <h1 className="font-heading text-[2rem] leading-10 font-normal tracking-tight">Log in</h1>
      <AuthForm mode="sign_in" notice={confirmationNotice(await searchParams)} />
    </main>
  );
}
