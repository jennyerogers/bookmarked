import Header from "../components/Header";
import Footer from "../components/Footer";
import { withIronSessionSsr } from "iron-session/next";
import sessionOptions from "../config/session";
import db from "../db";
import Link from "next/link";
import { useState } from "react";
import styles from "../styles/Favorites.module.css";

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user;
    const favorites = await db.favorites.getFavoriteBooks(user._id);
    return {
      props: {
        user,
        isLoggedIn: !!user,
        initialFavorites: favorites,
      }
    };
  },
  sessionOptions
);

export default function Favorites({ user, isLoggedIn, initialFavorites }) {
  const [bookShelf, setBookShelf] = useState(initialFavorites);

  async function handleRemove(bookId) {
    const res = await fetch('/api/favorites', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: bookId }),
    });

    if (res.status === 200) {
      setBookShelf((prev) => prev.filter(book => book.googleId !== bookId));
    }
  }

  return (
    <>
      <main>
        <Header isLoggedIn={isLoggedIn} />
        <div className={styles.container}>
          <h1>Your Bookshelf</h1>
          {bookShelf && bookShelf.length > 0 ? (
            <div className={styles.favoritesList}>
              {bookShelf.map(book => (
                <div key={book.googleId} className={styles.bookItem}>
                  <h2>{book.title}</h2>
                  {book.authors && (
                    <p>By: {book.authors.join(', ').replace(/, ([^,]*)$/, ', and $1')}</p>
                  )}
                  <Link href={`/book/${book.googleId}`}>
                    <img src={book.thumbnail || 'https://via.placeholder.com/128x190?text=NO COVER'} alt="Book cover" />
                  </Link>
                  <button onClick={() => handleRemove(book.googleId)}>Remove</button>
                </div>
              ))}
            </div>
          ) : (
            <p>Looks like you don't have any books on your shelf yet. Go to the search page to add some!</p>
          )}
        </div>
        <Footer/>
      </main>
    </>
  );
}
