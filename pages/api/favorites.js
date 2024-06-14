import { withIronSessionApiRoute } from 'iron-session/next';
import sessionOptions from '../../config/session'; 
import db from "../../db";
import User from '../models/user';

export default withIronSessionApiRoute(
  async function handler(req, res) {
    await connectDB();

    if (!req.session.user) {
      return res.status(401).end();
    }

    const { _id: userId } = req.session.user;

    switch (req.method) {
      case 'GET':
        try {
          const user = await User.findById(userId).select('favoritesList').exec();
          if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }
          return res.status(200).json({ favoritesList: user.favoritesList });
        } catch (error) {
          return res.status(400).json({ error: error.message });
        }

      case 'POST':
        try {
          const book = req.body;
          console.log('Received book data:', book);
          const user = await User.findById(userId).exec();
          if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }
          user.favoritesList.push(book);
          await user.save();
          return res.status(200).json({ book, message: 'Book added to favorites list' });
        } catch (error) {
          console.error('Error adding book to favorites:', error);
          return res.status(400).json({ error: error.message });
        }

      case 'DELETE':
        try {
          const { id } = req.body;
          console.log('Received book id for removal:', id);
          const user = await User.findById(userId).exec();
          if (!user) {
            return res.status(404).json({ error: 'User not found' });
          }
          user.favoritesList = user.favoritesList.filter(book => book.id !== id);
          await user.save();
          return res.status(200).json({ message: 'Book removed from favorites list' });
        } catch (error) {
          console.error('Error removing book from favorites:', error);
          return res.status(400).json({ error: error.message });
        }

      default:
        return res.status(404).end();
    }
  },
  sessionOptions
);
