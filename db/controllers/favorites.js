import User from "../models/user";
import dbConnect from "../connection";

export async function getFavoriteBooks(userId) {
  try {
    await dbConnect();
    const user = await User.findById(userId).lean();
    if (!user) return null;
    return JSON.parse(JSON.stringify(user.bookShelf));
  } catch (error) {
    console.error("Error fetching favorite books:", error);
    return null;
  }
}

export async function addToFavoriteBooks(userId, book) {
  try {
    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      return null;
    }

    await User.findByIdAndUpdate(
      userId,
      { $addToSet: { bookShelf: book } },
      { new: true }
    );
    return book;
  } catch (error) {
    console.error("Error adding to favorite books:", error);
    return null;
  }
}

export async function removeFavoriteBook(userId, bookId) {
  try {
    await dbConnect();
    const user = await User.findByIdAndUpdate(
      userId,
      { $pull: { bookShelf: { googleId: bookId } } },
      { new: true }
    );
    if (!user) return null;
    return true;
  } catch (error) {
    console.error("Error removing favorite book:", error);
    return null;
  }
}
