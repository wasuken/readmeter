"use client";

import { useEffect, useState } from "react";

type BookStatus = "Unread" | "Reading" | "Completed";

type Book = {
  id: string;
  title: string;
  isbn: string;
  status: BookStatus;
  rating: number | null;
};

const STATUS_LABEL: Record<BookStatus, string> = {
  Unread: "積読",
  Reading: "読中",
  Completed: "読了",
};

const STATUS_COLOR: Record<BookStatus, string> = {
  Unread: "bg-zinc-100 text-zinc-500",
  Reading: "bg-blue-50 text-blue-600",
  Completed: "bg-emerald-50 text-emerald-600",
};

function RatingStars({ value }: { value: number | null }) {
  if (value === null)
    return <span className="text-zinc-300 text-sm">未評価</span>;
  return (
    <span className="text-amber-400 text-sm tracking-tight">
      {"★".repeat(value)}
      {"☆".repeat(5 - value)}
    </span>
  );
}

export default function Home() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 追加フォーム
  const [form, setForm] = useState({ id: "", title: "", isbn: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 読了評価用の一時state: bookIdをkeyに rating の入力値を保持
  const [ratingInputs, setRatingInputs] = useState<Record<string, string>>({});

  async function fetchBooks() {
    try {
      const res = await fetch("/api/books");
      if (!res.ok) throw new Error("取得失敗");
      const data: Book[] = await res.json();
      setBooks(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "不明なエラー");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchBooks();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "追加失敗");
      setForm({ id: "", title: "", isbn: "" });
      await fetchBooks();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "不明なエラー");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleStart(id: string) {
    const res = await fetch(`/api/books/${id}/start`, { method: "PATCH" });
    if (res.ok) await fetchBooks();
    else {
      const data = await res.json();
      alert(data.error ?? "エラー");
    }
  }

  async function handleComplete(id: string) {
    const ratingRaw = ratingInputs[id];
    const rating = ratingRaw ? parseInt(ratingRaw, 10) : undefined;
    const body = rating !== undefined ? { rating } : {};
    const res = await fetch(`/api/books/${id}/complete`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      setRatingInputs((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      await fetchBooks();
    } else {
      const data = await res.json();
      alert(data.error ?? "エラー");
    }
  }

  async function handleDelete(id: string) {
    if (
      !confirm(`「${books.find((b) => b.id === id)?.title}」を削除しますか？`)
    )
      return;
    const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
    if (res.ok || res.status === 204) await fetchBooks();
    else {
      const data = await res.json();
      alert(data.error ?? "エラー");
    }
  }

  const grouped: Record<BookStatus, Book[]> = {
    Unread: books.filter((b) => b.status === "Unread"),
    Reading: books.filter((b) => b.status === "Reading"),
    Completed: books.filter((b) => b.status === "Completed"),
  };

  return (
    <div className="min-h-screen bg-zinc-50 font-sans">
      {/* ヘッダー */}
      <header className="bg-white border-b border-zinc-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-zinc-800 tracking-tight">
          📚 ReadMeter
        </h1>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8 space-y-10">
        {/* 追加フォーム */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-3">
            本を追加
          </h2>
          <form
            onSubmit={handleAdd}
            className="bg-white border border-zinc-200 rounded-xl p-5 space-y-3"
          >
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-zinc-500 mb-1">ID</label>
                <input
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="例: book-001"
                  value={form.id}
                  onChange={(e) => setForm({ ...form, id: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">
                  タイトル
                </label>
                <input
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="例: Clean Code"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 mb-1">
                  ISBN（13桁）
                </label>
                <input
                  className="w-full border border-zinc-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  placeholder="例: 9784048860000"
                  value={form.isbn}
                  onChange={(e) => setForm({ ...form, isbn: e.target.value })}
                  required
                />
              </div>
            </div>
            {formError && <p className="text-xs text-red-500">{formError}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg px-4 py-2 transition-colors"
            >
              {submitting ? "追加中…" : "追加する"}
            </button>
          </form>
        </section>

        {/* 本棚 */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-widest mb-3">
            本棚
          </h2>

          {loading && <p className="text-sm text-zinc-400">読み込み中…</p>}
          {error && <p className="text-sm text-red-500">{error}</p>}

          {!loading && books.length === 0 && (
            <p className="text-sm text-zinc-400">
              まだ本が登録されていません。
            </p>
          )}

          {(["Unread", "Reading", "Completed"] as BookStatus[]).map(
            (status) => {
              const group = grouped[status];
              if (group.length === 0) return null;
              return (
                <div key={status} className="mb-6">
                  <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2">
                    {STATUS_LABEL[status]}（{group.length}）
                  </h3>
                  <ul className="space-y-2">
                    {group.map((book) => (
                      <li
                        key={book.id}
                        className="bg-white border border-zinc-200 rounded-xl px-5 py-4 flex items-center gap-4"
                      >
                        {/* ステータスバッジ */}
                        <span
                          className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[book.status]}`}
                        >
                          {STATUS_LABEL[book.status]}
                        </span>

                        {/* 本情報 */}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-800 truncate">
                            {book.title}
                          </p>
                          <p className="text-xs text-zinc-400">
                            ISBN: {book.isbn}
                          </p>
                          {book.status === "Completed" && (
                            <RatingStars value={book.rating} />
                          )}
                        </div>

                        {/* アクション */}
                        <div className="flex items-center gap-2 shrink-0">
                          {book.status === "Unread" && (
                            <button
                              onClick={() => handleStart(book.id)}
                              className="text-xs bg-blue-50 hover:bg-blue-100 text-blue-600 font-medium px-3 py-1.5 rounded-lg transition-colors"
                            >
                              読み始める
                            </button>
                          )}
                          {book.status === "Reading" && (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                min={1}
                                max={5}
                                placeholder="評価 1-5"
                                value={ratingInputs[book.id] ?? ""}
                                onChange={(e) =>
                                  setRatingInputs((prev) => ({
                                    ...prev,
                                    [book.id]: e.target.value,
                                  }))
                                }
                                className="w-20 border border-zinc-200 rounded-lg px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-400"
                              />
                              <button
                                onClick={() => handleComplete(book.id)}
                                className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-600 font-medium px-3 py-1.5 rounded-lg transition-colors"
                              >
                                読了にする
                              </button>
                            </div>
                          )}
                          <button
                            onClick={() => handleDelete(book.id)}
                            className="text-xs text-zinc-300 hover:text-red-400 transition-colors px-1"
                            title="削除"
                          >
                            ✕
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            },
          )}
        </section>
      </main>
    </div>
  );
}
