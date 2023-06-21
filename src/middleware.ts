import { NextRequest, NextResponse } from "next/server";

export const config = {
  matchers: ["/", "/index"],
};

export function middleware(req: NextRequest) {
  if (process.env.IS_ENABLED_BASIC_AUTH !== "1") {
    return NextResponse.next();
  }

  const basicAuth = req.headers.get("authorization");
  const url = req.nextUrl;

  if (basicAuth) {
    const authValue = basicAuth.split(" ")[1];
    const [user, pwd] = atob(authValue).split(":");

    if (
      user === process.env.BASIC_AUTH_USERNAME &&
      pwd === process.env.BASIC_AUTH_PASSWORD
    ) {
      return NextResponse.next();
    }
  }

  return new NextResponse("Auth Required.", {
    status: 401,
    headers: {
      "WWW-authenticate": 'Basic realm="Secure Area"',
    },
  });
}
