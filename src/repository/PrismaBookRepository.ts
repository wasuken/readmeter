import { PrismaClient, Book as PrismaBook } from "@/generated/prisma/client";
import { BookRepository } from "./BookRepository";
import { Book } from "@/domain/entity/Book";
import { ISBN } from "@/domain/valueobject/ISBN";
import { Rating } from "@/domain/valueobject/Rating";
import { ReadingStatus } from "@/domain/valueobject/ReadingStatus";

export class PrismaBookRepository implements BookRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async save(book: Book): Promise<void> {
    await this.prisma.book.upsert({
      where: { id: book.id },
      update: this.toRecord(book),
      create: { id: book.id, ...this.toRecord(book) },
    });
  }

  async findById(id: string): Promise<Book | null> {
    const record = await this.prisma.book.findUnique({ where: { id } });
    if (!record) return null;
    return this.toDomain(record);
  }

  async findAll(): Promise<Book[]> {
    const records = await this.prisma.book.findMany();
    return records.map((r: PrismaBook) => this.toDomain(r));
  }

  async delete(id: string): Promise<void> {
    await this.prisma.book.delete({ where: { id } });
  }

  // ドメインオブジェクト → DBレコード用プレーンオブジェクト
  private toRecord(book: Book) {
    return {
      title: book.title,
      isbn: book.isbn.value,
      status: book.status,
      rating: book.rating?.value ?? null,
    };
  }

  // DBレコード → ドメインオブジェクト
  private toDomain(record: PrismaBook): Book {
    return new Book(
      record.id,
      record.title,
      new ISBN(record.isbn),
      record.status as ReadingStatus,
      record.rating !== null ? new Rating(record.rating) : null,
    );
  }
}
