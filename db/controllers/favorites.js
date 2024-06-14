import User from "../models/user";
import dbConnect from "../connection";

export async function getFavoriteBooks(userId) {
  await dbConnect();
  const user = await User.findById(userId).lean();

  if (!user) return null;
  return JSON.parse(JSON.stringify(user.bookShelf));
}

export async function addToFavoriteBooks(userId, book) {
  await dbConnect();
  const user = await User.findById(userId);
  if (!user) {
    return null;
  }
  const existingBook = user.bookShelf.find(
    (bookRepeat) => bookRepeat.id === book.id
  );
  if (existingBook) {
    return false;
  }
  await User.findByIdAndUpdate(
    userId,
    { $addToSet: { bookShelf: book } },
    { new: true }
  );
  return book;
}

export async function removeFavoriteBook(userId, bookId) {
  await dbConnect();
  const user = await User.findByIdAndUpdate(
    userId,
    { $pull: { bookShelf: { id: bookId } } },
    { new: true }
  );
  if (!user) return null;
  return true;
}
