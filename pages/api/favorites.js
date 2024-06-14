import { withIronSessionApiRoute } from 'iron-session/next';
import sessionOptions from '../../config/session'; 
import db from "../../db";


export default withIronSessionApiRoute(
  async function handler(req, res) {
    
    if(!req.session.user) {return res.status(401).end()}
    switch(req.method) {
      case 'POST':
        try {
          const book = JSON.parse(req.body)
          const addedBook = await db.favorites.addToBookshelf(req.session.user.id, book)
                    if(addedBook === null) {
            req.session.destroy() 
            return res.status(401)
          }
          return res.status(200).json({book: addedBook, message: "Book was added to your bookshelf!"})
        } catch (error) {
          return res.status(400).json({error: error.message})
        }
      case 'DELETE':
        try {
          const book = JSON.parse(req.body)
          const deletedBook = await db.book.removeFromBookshelf(req.session.user.id, book.id)

          if(deletedBook === null) {
            req.session.destroy()
            return res.status(401)
          }
          return res.status(200).json({book: deletedBook, message: "Book was removed from your bookshelf."})

        } catch (error) {
          return res.status(400).json({error: error.message})
        }
      default:
        return res.status(404).end()
    }
  },
  sessionOptions
)