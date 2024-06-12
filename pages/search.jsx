import styles from "../styles/Search.module.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useState } from "react";
import Link from "next/link";
import { withIronSessionSsr } from "iron-session/next";
import sessionOptions from "../config/session";

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

  async function handleSubmit(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearchPerformed(true);
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${query}&key=${process.env.NEXT_PUBLIC_API_KEY}`
      );
      const bookData = await res.json();
      console.log(bookData);
      if (bookData.totalItems > 0) {
        setBookInfo(bookData.items);
        setQuery("");
      } else {
        setBookInfo([]);
        setQuery("");
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  return (
    <>
      <main>
        <Header isLoggedIn={props.isLoggedIn} />
        <div className={styles.main}>
          <h1>Search</h1>
          <div>
            <form onSubmit={handleSubmit}>
              <input
                placeholder="Search by keyword"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                type="text"
                name="book-search"
              />
              <br />
              <br />
              <button type="submit">Submit</button>
            </form>
          </div>
          <div>
            {!searchPerformed && (
              <p>Search by keyword and view the first 10 book results.</p>
            )}
            {searchPerformed && bookInfo && bookInfo.length === 0 && (
              <p>No books found.</p>
            )}
            {bookInfo && bookInfo.length > 0 && (
              bookInfo.map((book) => {
                const volumeInfo = book.volumeInfo;
                return (
                  <div key={book.id}>
                    <h3>{volumeInfo.title}</h3>
                    <p>{volumeInfo.authors ? volumeInfo.authors.join(", ") : "Unknown Author"}</p>
                    {volumeInfo.imageLinks && volumeInfo.imageLinks.thumbnail ? (
                      <Link href={`/book/${book.id}`}>
                        <img src={volumeInfo.imageLinks.thumbnail} alt="Book Thumbnail" />
                      </Link>
                    ) : (
                      <p>Thumbnail unavailable.</p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
        <Footer />
      </main>
    </>
  );
}
//change this later