import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PrismaBookRepository } from "@/repository/PrismaBookRepository";
import { BookShelfService } from "@/service/BookShelfService";

// DI の組み立てはここで完結させる
// Service は BookRepository interface しか知らない
function buildService(): BookShelfService {
  const repo = new PrismaBookRepository(prisma);
  return new BookShelfService(repo);
}

export async function GET() {
  try {
    const service = buildService();
    const books = await service.getAll();

    const body = books.map((b) => ({
      id: b.id,
      title: b.title,
      isbn: b.isbn.value,
      status: b.status,
      rating: b.rating?.value ?? null,
    }));

    return NextResponse.json(body);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { id, title, isbn } = await req.json();

    if (!id || !title || !isbn) {
      return NextResponse.json(
        { error: "id, title, isbn は必須です" },
        { status: 400 },
      );
    }

    const service = buildService();
    const book = await service.addBook(id, title, isbn);

    return NextResponse.json(
      {
        id: book.id,
        title: book.title,
        isbn: book.isbn.value,
        status: book.status,
        rating: book.rating?.value ?? null,
      },
      { status: 201 },
    );
  } catch (e) {
    if (e instanceof Error) {
      return NextResponse.json({ error: e.message }, { status: 400 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
