import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState } from "react";
import Link from "next/link";
import { withIronSessionSsr } from "iron-session/next";
import sessionOptions from "../config/session";
import styles from "../styles/search.module.css";

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user;
    const props = {};

    if (user) {
      props.user = req.session.user;
      props.isLoggedIn = true;
    } else {
      props.isLoggedIn = false;
    }
    return { props };
  },
  sessionOptions
);

export default function Search(props) {
  const [query, setQuery] = useState("");
  const [bookInfo, setBookInfo] = useState([]);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchPerformed(true);
    setLoading(true);
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}`
      );
      const bookData = await res.json();
      setLoading(false);
      if (bookData.totalItems > 0) {
        setBookInfo(bookData.items);
        setQuery("");
      } else {
        setBookInfo([]);
        setQuery("");
      }
    } catch (error) {
      setLoading(false);
      console.error("Error fetching data:", error);
    }
  }

  return (
    <>
      <main>
        <Header isLoggedIn={props.isLoggedIn} />
        <div className={styles.main}>
          <h1 className={styles.title}>Search from thousands of books</h1>
          <div>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                placeholder="Search by author, title, BIN, ISBN..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                name="book-search"
                className={styles.input}
              />
              <br />
              <br />
              <button type="submit" className={styles.button}>Submit</button>
            </form>
          </div>
          <div className={styles.resultsContainer}>
            {loading && <p>Hang tight...</p>}
            {!loading && searchPerformed && bookInfo.length === 0 && <p>No books found.</p>}
            {bookInfo.length > 0 && bookInfo.map((book) => (
              <div key={book.id} className={styles.bookItem}>
                <h3>{book.volumeInfo.title}</h3>
                <p>{book.volumeInfo.authors?.join(", ")}</p>
                {book.volumeInfo.imageLinks?.thumbnail ? (
                  <Link href={`/book/${book.id}`}>
                    <img
                      src={book.volumeInfo.imageLinks.thumbnail}
                      alt="Book Cover"
                    />
                  </Link>
                ) : (
                  <p>Cover unavailable.</p>
                )}
              </div>
            ))}
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
