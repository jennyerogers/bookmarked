import { withIronSessionApiRoute } from 'iron-session/next';
import sessionOptions from '../../config/session'; 
import db from "../../db";

export default withIronSessionApiRoute(
  async function handler(req, res) {
    if (!req.session.user) {
      return res.status(401).end();
    }

    switch (req.method) {
      case 'POST':
        try {
          const book = req.body;
          const addedBook = await db.favorites.addToFavoriteBooks(req.session.user._id, book);
          if (!addedBook) {
            return res.status(500).json({ error: "Failed to add book to your bookshelf." });
          }
          return res.status(200).json({ book: addedBook, message: "Book was added to your bookshelf!" });
        } catch (error) {
          return res.status(400).json({ error: error.message });
        }

      case 'DELETE':
        try {
          const { id } = req.body;
          const deletedBook = await db.favorites.removeFavoriteBook(req.session.user._id, id);
          if (!deletedBook) {
            return res.status(500).json({ error: "Failed to remove book from your bookshelf." });
          }
          return res.status(200).json({ bookId: id, message: "Book was removed from your bookshelf." });
        } catch (error) {
          return res.status(400).json({ error: error.message });
        }

      default:
        return res.status(404).end();
    }
  },
  sessionOptions
);
