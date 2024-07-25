import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { withIronSessionSsr } from 'iron-session/next';
import sessionOptions from '../../config/session';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import styles from '../../styles/book.module.css';

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req, params }) {
    const user = req.session.user;
    const bookId = params.id;
    const props = {};

    if (user) {
      props.user = user;

      const response = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
      const bookData = await response.json();

      if (bookData && bookData.volumeInfo) {
        props.book = {
          googleId: bookId,
          title: bookData.volumeInfo.title,
          authors: bookData.volumeInfo.authors,
          thumbnail: bookData.volumeInfo.imageLinks?.thumbnail || 'https://via.placeholder.com/128x190?text=NO COVER',
          description: bookData.volumeInfo.description,
          pageCount: bookData.volumeInfo.pageCount,
          categories: bookData.volumeInfo.categories || [], // Set categories to empty array if undefined
          previewLink: bookData.volumeInfo.previewLink,
        };

        const bookShelf = user.bookShelf || [];
        props.isFavoriteBook = bookShelf.some(b => b.googleId === bookId);
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

const stripHtmlTags = (str) => {
  if (!str) return '';
  return str.replace(/<\/?[^>]+(>|$)/g, '');
};

const BookInfo = (props) => {
  const router = useRouter();
  const { id } = router.query;
  const [book, setBook] = useState(props.book);
  const [isFavoriteBook, setIsFavoriteBook] = useState(props.isFavoriteBook);
  const { isLoggedIn } = props;

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
      setIsFavoriteBook(true);
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
      body: JSON.stringify({ id: book.googleId }),
    });

    if (res.status === 200) {
      setIsFavoriteBook(false);
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

  const cleanDescription = stripHtmlTags(description);

  return (
    <>
      <Head>
        <title>{title} - Bookmarked</title>
        <meta name="description" content="Viewing a book on Bookmarked" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔎</text></svg>" />
      </Head>
      <Header isLoggedIn={isLoggedIn} />
      <main className={styles.container}>
        <div className={styles.titleGroup}>
          <div>
            <h1>
              {title}
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
              src={thumbnail}
              alt={title}
            />
            <span>Look Inside!</span>
          </a>
        </div>
        <p className={styles.description}>Description: {cleanDescription}</p>
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
      <button onClick={removeFromFavorites} className={styles.addToBookshelfButton}>
        Remove from Bookshelf
      </button>
    ) : (
      <button onClick={addToFavoriteBooks} className={styles.addToBookshelfButton}>
        Add to Bookshelf
      </button>
    )}
  </div>
)}
        <Link href="/search" className={styles.returnLink}>
          Return to Search
        </Link>
        <Footer />
      </main>
    </>
  );
};

export default BookInfo;
