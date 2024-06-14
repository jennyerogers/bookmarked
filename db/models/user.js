import { Schema, model, models } from 'mongoose'
import bcrypt from 'bcrypt'
import bookSchema from './book'

const UserSchema = new Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true,
    minLength: 5,
    maxLength: 200
  },
  bookShelf: [bookSchema]
})


UserSchema.pre('save', async function(next) {
  if (this.isNew)
    this.password = await bcrypt.hash(this.password, 10)
  next()
})

export default models.User || model('User', UserSchema)