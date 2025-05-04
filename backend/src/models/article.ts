import { Schema, model, Document, Types } from 'mongoose';

interface IArticle extends Document {
  author: Types.ObjectId; // Use Types.ObjectId instead of Schema.Types.ObjectId
  title: string;
  description: string;
  category: string;
  tags: string[];
  images: string[];
  likes: number;
  dislikes: number;
  blockedBy: Types.ObjectId[]; // Also changed to Types.ObjectId
}

const articleSchema = new Schema<IArticle>({
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true, validate: {
    validator: async function(value: Types.ObjectId) {
      const user = await model('User').exists({ _id: value });
      return user !== null;
    },
    message: 'User does not exist'
  }},
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  tags: { type: [String], required: true },
  images: { type: [String], default: [] },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 },
  blockedBy: { type: [Schema.Types.ObjectId], default: [] }
}, {
  timestamps: true  // 👈 This adds createdAt and updatedAt fields
});

const Article = model<IArticle>('Article', articleSchema,'articles');
export default Article;
