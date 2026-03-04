import { NextResponse } from "next/server";
import { NotFoundError, DomainError } from "../errors/AppError";

export function handleError(e: unknown): NextResponse {
  if (e instanceof NotFoundError) {
    return NextResponse.json({ error: e.message }, { status: 404 });
  }
  if (e instanceof DomainError) {
    return NextResponse.json({ error: e.message }, { status: 422 });
  }
  if (e instanceof Error) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
  return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
}
