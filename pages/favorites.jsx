import Header from "../components/Header";
import Footer from "../components/Footer";
import { withIronSessionSsr } from "iron-session/next";
import sessionOptions from "../config/session";
import db from "../db";
import Link from "next/link";
import styles from "../styles/Favorites.module.css";

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user;
    const props = {};
    if (user) {
      const favorites = await db.books.getFavoriteBooks(user._id);
      props.user = user;
      props.favoritesList = favorites;
      props.isLoggedIn = true;
    } else {
      props.isLoggedIn = false;
    }
    return { props };
  },
  sessionOptions
);

export default function Favorites({ isLoggedIn, favoritesList }) {
  return (
    <>
      <main>
        <Header isLoggedIn={isLoggedIn} />
        <div className={styles.container}>
          <h1>Favorites</h1>
          {favoritesList && favoritesList.length > 0 ? (
            <div className={styles.favoritesList}>
              {favoritesList.map(book => (
                <div key={book.id} className={styles.bookItem}>
                  <h2>{book.title}</h2>
                  {book.authors && (
                    <p>By: {book.authors.join(', ').replace(/, ([^,]*)$/, ', and $1')}</p>
                  )}
                  <Link href={`/book/${book.id}`}>
                    <img src={book.thumbnail || 'https://via.placeholder.com/128x190?text=NO COVER'} alt="Book cover" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <p>No favorite books found. Visit the search page to start adding books to your favorites.</p>
          )}
        </div>
        <Footer />
      </main>
    </>
  );
}
