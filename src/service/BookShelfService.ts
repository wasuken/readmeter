import { Book } from "../domain/entity/Book";
import { ISBN } from "../domain/valueobject/ISBN";
import { Rating } from "../domain/valueobject/Rating";
import { ReadingStatus } from "../domain/valueobject/ReadingStatus";
import { BookRepository } from "../repository/BookRepository";

export class BookShelfService {
  constructor(private readonly repo: BookRepository) {}

  async addBook(id: string, title: string, isbnValue: string): Promise<Book> {
    const isbn = new ISBN(isbnValue);
    const book = new Book(id, title, isbn, ReadingStatus.Unread, null);
    await this.repo.save(book);
    return book;
  }

  async startReading(id: string): Promise<Book> {
    const book = await this.repo.findById(id);
    if (!book) throw new Error(`Book not found: ${id}`);
    book.changeStatus(ReadingStatus.Reading);
    await this.repo.save(book);
    return book;
  }

  async completeReading(id: string, ratingValue?: number): Promise<Book> {
    const book = await this.repo.findById(id);
    if (!book) throw new Error(`Book not found: ${id}`);
    book.changeStatus(ReadingStatus.Completed);
    if (ratingValue !== undefined) {
      book.addRating(new Rating(ratingValue));
    }
    await this.repo.save(book);
    return book;
  }

  async getAll(): Promise<Book[]> {
    return this.repo.findAll();
  }

  async removeBook(id: string): Promise<void> {
    const book = await this.repo.findById(id);
    if (!book) throw new Error(`Book not found: ${id}`);
    await this.repo.delete(id);
  }
}
