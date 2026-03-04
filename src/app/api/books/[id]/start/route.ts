import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PrismaBookRepository } from "@/repository/PrismaBookRepository";
import { BookShelfService } from "@/service/BookShelfService";
import { handleError } from "@/lib/handleError";

function buildService(): BookShelfService {
  const repo = new PrismaBookRepository(prisma);
  return new BookShelfService(repo);
}

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const service = buildService();
    const book = await service.startReading(id);

    return NextResponse.json({
      id: book.id,
      title: book.title,
      isbn: book.isbn.value,
      status: book.status,
      rating: book.rating?.value ?? null,
    });
  } catch (e) {
    return handleError(e);
  }
}
