import { Schema } from "mongoose"

const bookSchema = new Schema({
    title: {
      type: String,
      required: true,
    },
    authors: {
      type: [String], 
      required: true,
    },
    thumbnail: {
      type: String,
    },
  });
  
  const Book = mongoose.model('Book', bookSchema);
  
  export default bookSchema;