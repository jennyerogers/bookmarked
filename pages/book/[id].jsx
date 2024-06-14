import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { withIronSessionSsr } from "iron-session/next";
import sessionOptions from "../../config/session";

function stripHtmlTags(html) {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '');
}

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

export default function BookInfo(props) {
  const router = useRouter();
  const { id } = router.query;
  const [bookInfo, setBookInfo] = useState(null);

  async function handleInfo(bookId) {
    try {
      const res = await fetch(
        `https://www.googleapis.com/books/v1/volumes/${bookId}`
      );
      const bookData = await res.json();
      setBookInfo(bookData.volumeInfo);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }

  useEffect(() => {
    if (id) {
      handleInfo(id);
    }
  }, [id]);

  async function addToReadingList(e) {
    e.preventDefault();
    const res = await fetch("/api/readingList", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id,
        title: bookInfo.title,
        authors: bookInfo.authors,
        thumbnail: bookInfo.imageLinks?.thumbnail,
      }),
    });
    if (res.status === 200) {
      router.replace(router.asPath);
      console.log("Book added to Reading List:", bookInfo);
    }
  }

  async function removeFromReadingList(e) {
    e.preventDefault();
    const res = await fetch("/api/readingList", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id }),
    });
    if (res.status === 200) {
      router.replace(router.asPath);
      console.log("Book removed from Reading List:", bookInfo);
    }
  }

  return (
    <>
      <main>
        <Header isLoggedIn={props.isLoggedIn} />
        <div>
          {bookInfo ? (
            <>
              <h1>{bookInfo.title}</h1>
              <img src={bookInfo.imageLinks?.thumbnail} alt="Book Thumbnail" />
              <p>Authors: {bookInfo.authors?.join(", ")}</p>
              <p>Published Date: {bookInfo.publishedDate}</p>
              <p>Description: {stripHtmlTags(bookInfo.description)}</p>
            </>
          ) : id ? (
            <p>Loading...</p>
          ) : null}
          <button onClick={addToReadingList}>
            Add to Reading List
          </button>
          <button onClick={removeFromReadingList}>
            Remove from Reading List
          </button>
        </div>
        <Footer />
      </main>
    </>
  );
}
