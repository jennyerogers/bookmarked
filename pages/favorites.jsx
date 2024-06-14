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
    const favorites = await db.book.getAllBooks(user.id)

    const props = {};
    if (user) {
      
      props.isLoggedIn = true;
    } else {
      props.isLoggedIn = false;
    }
    return {
      props: {
        user: req.session.user,
        isLoggedIn: true,
        bookShelf: favorites,
      }
    }
  },
  sessionOptions
);

export default function Favorites(props) {
  return (
    <>
      <main>
        <Header isLoggedIn={isLoggedIn} />
        <div className={styles.container}>
          <h1>Favorites</h1>
          {bookShelf && bookShelf.length > 0 ? (
            <div className={styles.favoritesList}>
              {bookShelf.map(book => (
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
            <p>Looks like you don't have any books on your shelf yet. Go to the search page to add some!</p>
          )}
        </div>
        <Footer/>
      </main>
    </>
  );
}
