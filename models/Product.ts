import { Schema, model, Document } from 'mongoose'

export interface IProduct extends Document {
  name: string
  description: string
  price: number
  category: string
  image: string
  active: boolean
  whatsappMessage: string
}

const ProductSchema = new Schema<IProduct>({
  name: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  category: { type: String, required: true, trim: true },
  image: { type: String, required: true },
  active: { type: Boolean, default: true },
  whatsappMessage: { type: String, required: true }
}, {
  timestamps: true
})

export default model<IProduct>('Product', ProductSchema)
