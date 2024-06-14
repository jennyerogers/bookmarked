import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { withIronSessionSsr } from 'iron-session/next';
import sessionOptions from '../../config/session';
import * as favoritesController from '../../db/controllers/favorites';
import styles from '../../styles/Book.module.css';

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req, params }) {
    const { user } = req.session;
    const props = {};

    if (user) {
      const book = await favoritesController.getByGoogleId(user.id, params.id);
      props.user = user;
      props.book = book || null;
    }

    props.isLoggedIn = !!user;
    return { props };
  },
  sessionOptions
);

export default function Book({ user, isLoggedIn, book: serverBook }) {
  const router = useRouter();
  const { id: bookId } = router.query;
  const [book, setBook] = useState(serverBook);
  const [isFavorite, setIsFavorite] = useState(!!serverBook);

  useEffect(() => {
    if (!serverBook) {
      fetchBookDetails();
    }
  }, [serverBook]);

  const fetchBookDetails = async () => {
    const response = await fetch(`/api/googlebooks/${bookId}`);
    const data = await response.json();
    setBook(data);
  };

  const handleAddToBookshelf = async () => {
    const response = await fetch(`/api/favorites`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(book),
    });

    if (response.ok) {
      setIsFavorite(true);
      router.replace(router.asPath);
    }
  };

  const handleRemoveFromBookshelf = async () => {
    const response = await fetch(`/api/favorites`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: bookId }),
    });

    if (response.ok) {
      setIsFavorite(false);
      router.replace(router.asPath);
    }
  };

  if (!book) {
    return <p>Loading...</p>;
  }

  return (
    <>
      <Head>
        <title>{book.title}</title>
      </Head>
      <Header isLoggedIn={isLoggedIn} />
      <main>
        <div className={styles.bookDetails}>
          <h1>{book.title} {isFavorite && <sup>⭐</sup>}</h1>
          {book.authors && <h2>By: {book.authors.join(', ')}</h2>}
          <img src={book.thumbnail || 'https://via.placeholder.com/128x190?text=NO COVER'} alt={book.title} />
          <p>{book.description}</p>
          <p>Pages: {book.pageCount}</p>
          <div className={styles.controls}>
            {isLoggedIn ? (
              isFavorite ? (
                <button onClick={handleRemoveFromBookshelf}>Remove from bookshelf</button>
              ) : (
                <button onClick={handleAddToBookshelf}>Add to bookshelf</button>
              )
            ) : (
              <>
                <p>XXX</p>
                <Link href="/login"><a className="button">Login</a></Link>
              </>
            )}
            <button onClick={() => router.back()}>Back</button>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
