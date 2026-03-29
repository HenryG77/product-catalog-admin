import { Schema, model, Document } from 'mongoose'

export interface ICategory extends Document {
  name: string
  description: string
  active: boolean
}

const CategorySchema = new Schema<ICategory>({
  name: { type: String, required: true, trim: true, unique: true },
  description: { type: String },
  active: { type: Boolean, default: true }
}, {
  timestamps: true
})

export default model<ICategory>('Category', CategorySchema)
