import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { withIronSessionSsr } from 'iron-session/next';
import sessionOptions from '../../config/session';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import db from '../../db';
import styles from '../../styles/Book.module.css';

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req, params }) {
    const user = req.session.user;
    const bookId = params.id;
    const props = {};

    if (user) {
      props.user = req.session.user;

      const book = await db.favorites.getFavoriteBooks(bookId); 
      if (book) {
        props.book = book;
        props.isFavoriteBook = user.bookShelf.some(b => b.id === bookId);
      } else {
        return {
          notFound: true, 
        };
      }
    }

    props.isLoggedIn = !!user;
    return {
      props,
    };
  },
  sessionOptions
);

export default function BookInfo(props) {
  const router = useRouter();
  const { id } = router.query;
  const [book, setBook] = useState(props.book);
  const { isLoggedIn, isFavoriteBook } = props;

  useEffect(() => {
    if (!book) {
      router.push('/'); 
    }
  }, [book, router]);

  async function addToFavoriteBooks(e) {
    e.preventDefault();
    const res = await fetch('/api/favorites', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(book),
    });

    if (res.status === 200) {
      router.replace(router.asPath);
    }
  }

  async function removeFromFavorites(e) {
    e.preventDefault();
    const res = await fetch('/api/favorites', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id }),
    });

    if (res.status === 200) {
      router.replace(router.asPath);
    }
  }

  if (!book) {
    return <div>Loading...</div>; 
  }

  const {
    title,
    authors,
    thumbnail,
    description,
    pageCount,
    categories,
    previewLink,
  } = book;

  return (
    <>
      <Head>
        <title>{title} - Bookmarked</title>
        <meta name="description" content="Viewing a book on Bookmarked" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📚</text></svg>" />
      </Head>
      <Header isLoggedIn={isLoggedIn} />
      <main>
        <div className={styles.titleGroup}>
          <div>
            <h1>
              {title}
              {isFavoriteBook && <sup>⭐</sup>}
            </h1>
            {authors && authors.length > 0 && (
              <h2>By: {authors.join(', ').replace(/, ([^,]*)$/, ', and $1')}</h2>
            )}
            {categories && categories.length > 0 && (
              <h3>Category: {categories.join(', ').replace(/, ([^,]*)$/, ', and $1')}</h3>
            )}
          </div>
          <a
            target="_blank"
            href={previewLink}
            className={styles.imgContainer}
            rel="noreferrer"
          >
            <img
              src={thumbnail ? thumbnail : 'https://via.placeholder.com/128x190?text=NO COVER'}
              alt={title}
            />
            <span>Look Inside!</span>
          </a>
        </div>
        <p className={styles.description}>Description: {description}</p>
        <p>Pages: {pageCount}</p>
        <div className={styles.links}>
          <span>Order online:</span>
          <a
            target="_blank"
            href={`https://www.amazon.com/s?k=${encodeURIComponent(title)} ${
              authors ? encodeURIComponent(authors[0]) : ''
            }`}
            rel="noreferrer"
          >
            Amazon
          </a>
          <a
            target="_blank"
            href={`https://www.barnesandnoble.com/s/${encodeURIComponent(title)} ${
              authors ? encodeURIComponent(authors[0]) : ''
            }`}
            rel="noreferrer"
          >
            Barnes & Noble
          </a>
        </div>
        {isLoggedIn && (
          <div className={styles.controls}>
            {isFavoriteBook ? (
              <button onClick={removeFromFavorites}>
                Remove from Favorites
              </button>
            ) : (
              <button onClick={addToFavoriteBooks}>
                Add to Favorites
              </button>
            )}
          </div>
        )}
        <Link href="/search">
          <a className={styles.returnLink}>Return to Search</a>
        </Link>
      </main>
    </>
  );
}
