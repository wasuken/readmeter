import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PrismaBookRepository } from "@/repository/PrismaBookRepository";
import { BookShelfService } from "@/service/BookShelfService";
import { handleError } from "@/lib/handleError";

function buildService(): BookShelfService {
  const repo = new PrismaBookRepository(prisma);
  return new BookShelfService(repo);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const service = buildService();
    await service.removeBook(id);

    return new NextResponse(null, { status: 204 });
  } catch (e) {
    return handleError(e);
  }
}
