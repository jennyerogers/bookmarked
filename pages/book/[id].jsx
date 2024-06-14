import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { withIronSessionSsr } from "iron-session/next";
import sessionOptions from "../../config/session";

export const getServerSideProps = withIronSessionSsr(
  async function getServerSideProps({ req }) {
    const user = req.session.user
    const props = {}
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

  async function addToBookshelf(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/favorites", {
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
        console.log("Book added to bookshelf:", bookInfo);
      } else {
        const errorData = await res.json();
        console.error("Error adding book to bookshelf:", errorData.error);
      }
    } catch (error) {
      console.error("Error adding book to bookshelf:", error);
    }
  }

  async function removeFromBookshelf(e) {
    e.preventDefault();
    try {
      const res = await fetch("/api/favorites", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id }),
      });
      if (res.status === 200) {
        router.replace(router.asPath);
        console.log("Book removed from bookshelf:", bookInfo);
      } else {
        const errorData = await res.json();
        console.error("Error removing book from bookshelf:", errorData.error);
      }
    } catch (error) {
      console.error("Error removing book from favorites:", error);
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
              <p>Description: {bookInfo.description}</p>
              <button onClick={addToBookshelf}>
                Add to Favorites
              </button>
              <button onClick={removeFromBookshelf}>
                Remove from Favorites
              </button>
            </>
          ) : id ? (
            <p>Loading...</p>
          ) : null}
        </div>
        <Footer />
      </main>
    </>
  );
}
