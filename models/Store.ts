import { Schema, model, Document } from 'mongoose'

export interface IStore extends Document {
  name: string
  logo: string
  whatsapp: string
  primaryColor: string
  secondaryColor: string
  description: string
  address?: string
  email?: string
}

const StoreSchema = new Schema<IStore>({
  name: { type: String, required: true, trim: true },
  logo: { type: String, required: true },
  whatsapp: { type: String, required: true },
  primaryColor: { type: String, default: '#3b82f6' },
  secondaryColor: { type: String, default: '#1e40af' },
  description: { type: String, required: true },
  address: { type: String },
  email: { type: String }
}, {
  timestamps: true
})

export default model<IStore>('Store', StoreSchema)
