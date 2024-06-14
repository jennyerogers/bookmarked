import Head from 'next/head'
import { useRouter } from "next/router"
import Link from 'next/link'
import { useEffect } from 'react'
import { withIronSessionSsr } from "iron-session/next";
import sessionOptions from "../../config/session";
import { useBookContext } from "../../context/book"
import Header from '../../components/header'
import db from '../../db'
import styles from '../../styles/Book.module.css'

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req, params }) {
    const { user } = req.session;
    const props = {};
    if (user) {
      props.user = req.session.user;
      const book = await db.book.getByGoogleId(req.session.user.id, params.id)
      if (book)
        props.book = book
    }
    props.isLoggedIn = !!user;
    return { props };
  },
  sessionOptions
);

export default function Book(props) {
  const router = useRouter()
  const bookId = router.query.id
  const { isLoggedIn } = props
  const [{bookSearchResults}] = useBookContext()

  let isFavoriteBook = false
  let book
  if (props.book) {
    book = props.book
    isFavoriteBook = true
  } else
    book = bookSearchResults.find(book => book.googleId === bookId)

  // No book from search/context or getServerSideProps/favorites, redirect to Homepage
  useEffect(() => {
    if (!props.book && !book)
      router.push('/')
  }, [props.book, bookSearchResults, book, router])

  async function addToFavorites() {
    const response = await fetch('/api/book', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(book),
    });

    if (response.ok) {
      router.replace(router.asPath);
    }
  }

  async function removeFromFavorites() {
    const response = await fetch('/api/book', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: bookId }),
    });

    if (response.ok) {
      router.replace(router.asPath);
    }
  }

  return (
    <>
      <Head>
        <title>Booker Book</title>
        <meta name="description" content="Viewing a book on booker" />
        <link rel="icon" href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>📚</text></svg>" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <Header isLoggedIn={isLoggedIn} />
      {
        book &&
        <main>
          <BookInfo isFavorite={isFavoriteBook} {...book}/>
          <div className={styles.controls}>
            {
              !isLoggedIn
              ? <>
                  <p>Want to add this book to your favorites?</p>
                  <Link href="/login" className="button">Login</Link>
                </>
              : isFavoriteBook
              ? <button onClick={removeFromFavorites}>
                  Remove from Favorites
                </button>
              : <button onClick={addToFavorites}>
                  Add to Favorites
                </button>
            }

            <a href="#" onClick={() => router.back()}>
              Return
            </a>
          </div>
        </main>
      }
    </>
  )
}

function BookInfo({
  title,
  authors,
  thumbnail,
  description,
  isFavorite,
  pageCount,
  categories,
  previewLink
}) {
  return (
    <>
      <div className={styles.titleGroup}>
        <div>
          <h1>{title}{isFavorite && <sup>⭐</sup>}</h1>
          {
            authors && authors.length > 0 &&
            <h2>By: {authors.join(", ").replace(/, ([^,]*)$/, ', and $1')}</h2>
          }
          {
            categories && categories.length > 0 &&
            <h3>Category: {categories.join(", ").replace(/, ([^,]*)$/, ', and $1')}</h3>
          }
        </div>
        <a target="_BLANK"
          href={previewLink}
          className={styles.imgContainer}
          rel="noreferrer">
          <img src={thumbnail
            ? thumbnail
            : "https://via.placeholder.com/128x190?text=NO COVER"} alt={title} />
          <span>Look Inside!</span>
        </a>
      </div>
      <p>Description:<br/>{description}</p>
      <p>Pages: {pageCount}</p>
      <div className={styles.links}>
        <span>Order online:</span>
        <a target="_BLANK"
          href={`https://www.amazon.com/s?k=${title} ${authors ? authors[0] : ""}`}
          rel="noreferrer">
          Amazon
        </a>
        <a target="_BLANK"
          href={`https://www.barnesandnoble.com/s/${title} ${authors ? authors[0] : ""}`}
          rel="noreferrer">
          Barnes & Noble
        </a>
      </div>
    </>
  )
}
