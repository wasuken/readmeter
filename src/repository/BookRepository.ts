import { Book } from "@/domain/entity/Book";

export interface BookRepository {
  save(book: Book): Promise<void>;
  findById(id: string): Promise<Book | null>;
  findAll(): Promise<Book[]>;
  delete(id: string): Promise<void>;
}
