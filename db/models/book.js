import { Schema } from 'mongoose'

const bookSchema = new Schema({
  googleId: String,
  title: String,
  authors: [String],
  thumbnail: String,
  previewLink: String,
})

export default bookSchema