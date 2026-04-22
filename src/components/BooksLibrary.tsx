import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Search, Star } from "lucide-react";

interface Book {
  id: string;
  title: string;
  author: string;
  cover: string;
  rating: number;
  category: string;
  description: string;
  chapters: number;
}

const BOOKS: Book[] = [
  { id: "1", title: "Mere Christianity", author: "C.S. Lewis", cover: "📘", rating: 4.8, category: "Theology", description: "A classic exploration of the common ground upon which all Christians can stand together.", chapters: 14 },
  { id: "2", title: "The Purpose Driven Life", author: "Rick Warren", cover: "📗", rating: 4.6, category: "Devotional", description: "A groundbreaking manifesto on the meaning of life, exploring God's five purposes.", chapters: 40 },
  { id: "3", title: "Knowing God", author: "J.I. Packer", cover: "📕", rating: 4.7, category: "Theology", description: "A deeply theological yet accessible exploration of God's nature and character.", chapters: 22 },
  { id: "4", title: "The Screwtape Letters", author: "C.S. Lewis", cover: "📙", rating: 4.9, category: "Fiction", description: "A satirical Christian apologetic novel written as a series of letters from a senior demon.", chapters: 31 },
  { id: "5", title: "Pilgrim's Progress", author: "John Bunyan", cover: "📓", rating: 4.5, category: "Fiction", description: "An allegory of the Christian journey from this world to the next.", chapters: 20 },
  { id: "6", title: "Boundaries", author: "Henry Cloud", cover: "📒", rating: 4.4, category: "Self-Help", description: "When to say yes, how to say no, to take control of your life through biblical principles.", chapters: 18 },
  { id: "7", title: "Desiring God", author: "John Piper", cover: "📘", rating: 4.7, category: "Theology", description: "Meditations of a Christian hedonist — finding supreme happiness in God.", chapters: 12 },
  { id: "8", title: "Radical", author: "David Platt", cover: "📗", rating: 4.3, category: "Discipleship", description: "Taking back your faith from the American Dream and following Jesus wholeheartedly.", chapters: 10 },
  { id: "9", title: "Celebration of Discipline", author: "Richard Foster", cover: "📕", rating: 4.6, category: "Spiritual Growth", description: "The path to spiritual growth through twelve classical disciplines of the faith.", chapters: 13 },
  { id: "10", title: "Jesus Calling", author: "Sarah Young", cover: "📙", rating: 4.5, category: "Devotional", description: "365 devotions offering peace for today through the words of Jesus.", chapters: 365 },
];

const CATEGORIES = ["All", "Theology", "Devotional", "Fiction", "Self-Help", "Discipleship", "Spiritual Growth"];

const BooksLibrary = ({ onBack }: { onBack: () => void }) => {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);

  const filtered = BOOKS.filter((b) => {
    const matchCat = category === "All" || b.category === category;
    const matchSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.author.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (selectedBook) {
    return (
      <div className="min-h-screen bg-background pb-24">
        <div className="px-5 pt-safe pb-4">
          <button onClick={() => setSelectedBook(null)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-body">Back to Library</span>
          </button>
        </div>
        <div className="px-5">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-24 h-32 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-4xl shrink-0">
              {selectedBook.cover}
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-heading text-xl font-bold text-foreground">{selectedBook.title}</h1>
              <p className="text-sm text-muted-foreground font-body mt-1">by {selectedBook.author}</p>
              <div className="flex items-center gap-1 mt-2">
                <Star className="w-3.5 h-3.5 text-primary fill-primary" />
                <span className="text-xs font-body font-semibold text-foreground">{selectedBook.rating}</span>
                <span className="text-xs text-muted-foreground font-body ml-2">{selectedBook.chapters} chapters</span>
              </div>
              <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-body font-medium">{selectedBook.category}</span>
            </div>
          </div>

          <p className="text-sm font-body text-foreground leading-relaxed mb-6">{selectedBook.description}</p>

          <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-heading font-semibold text-sm">
            Start Reading
          </button>

          <div className="mt-8">
            <h3 className="font-heading text-sm font-semibold text-foreground mb-3">Chapters</h3>
            <div className="space-y-2">
              {Array.from({ length: Math.min(selectedBook.chapters, 10) }, (_, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="w-full flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors text-left"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-heading font-bold text-foreground">{i + 1}</span>
                    <span className="text-sm font-body text-foreground">Chapter {i + 1}</span>
                  </div>
                  <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
                </motion.button>
              ))}
              {selectedBook.chapters > 10 && (
                <p className="text-center text-xs text-muted-foreground font-body py-2">+{selectedBook.chapters - 10} more chapters</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="px-5 pt-safe pb-4">
        <button onClick={onBack} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4">
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-body">Back to Discover</span>
        </button>
        <h1 className="font-heading text-2xl font-bold text-foreground">Books</h1>
        <p className="text-xs text-muted-foreground font-body mt-1">Explore Christian literature</p>
      </div>

      <div className="px-5 py-2">
        <div className="flex items-center gap-3 bg-secondary rounded-xl px-4 py-3">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            type="text"
            placeholder="Search books or authors..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm font-body text-foreground placeholder:text-muted-foreground outline-none w-full"
          />
        </div>
      </div>

      <div className="px-5 py-2 flex gap-2 overflow-x-auto scrollbar-hide">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1.5 rounded-full text-xs font-body font-medium whitespace-nowrap transition-all ${
              category === c ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="px-5 mt-4 space-y-3">
        {filtered.map((book, i) => (
          <motion.button
            key={book.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            onClick={() => setSelectedBook(book)}
            className="w-full flex gap-4 p-4 rounded-xl bg-card border border-border hover:border-primary/20 transition-colors text-left"
          >
            <div className="w-14 h-18 rounded-lg bg-primary/10 flex items-center justify-center text-2xl shrink-0">
              {book.cover}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-heading text-sm font-semibold text-foreground truncate">{book.title}</h3>
              <p className="text-xs text-muted-foreground font-body mt-0.5">{book.author}</p>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-0.5">
                  <Star className="w-3 h-3 text-primary fill-primary" />
                  <span className="text-[10px] font-body font-semibold text-foreground">{book.rating}</span>
                </div>
                <span className="text-[10px] text-muted-foreground font-body">{book.category}</span>
              </div>
            </div>
          </motion.button>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-sm font-body">No books found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BooksLibrary;
