const MAIL_PATHS = ["/signup", "/invite", "/otp", "/magiclink", "/recover"] as const;

export function confirmedTestUserAttributes(email: string, password: string): {
  email: string;
  password: string;
  email_confirm: true;
} {
  return { email, password, email_confirm: true };
}

export function authTestRequestPath(input: RequestInfo | URL): string {
  const raw = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
  return new URL(raw).pathname;
}

export function refusesAuthEmail(pathname: string): boolean {
  return MAIL_PATHS.some((path) => pathname === path || pathname.endsWith(path));
}

export function authTestFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const pathname = authTestRequestPath(input);
  if (refusesAuthEmail(pathname)) return Promise.reject(new Error(`auth test refused ${pathname}`));
  return fetch(input, init);
}
