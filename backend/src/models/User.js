import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const addressSchema = new mongoose.Schema({
  label: { type: String, trim: true, default: 'Home' },
  street: { type: String, trim: true, required: true },
  city: { type: String, trim: true, required: true },
  state: { type: String, trim: true },
  zip: { type: String, trim: true, required: true },
  country: { type: String, trim: true, required: true },
}, { _id: true })

const userSchema = new mongoose.Schema({
  name: { type: String, required: [true, 'Name is required'], trim: true },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false,
  },
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  phone: { type: String, trim: true },
  addresses: [addressSchema],
  defaultAddressId: { type: mongoose.Schema.Types.ObjectId },
  isEmailVerified: { type: Boolean, default: false },
  refreshTokenHash: { type: String, select: false, default: null },
  refreshTokenId: { type: String, select: false, default: null },
}, { timestamps: true })

// Hash password on save/modify (12 rounds).
userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = function comparePassword(candidate) {
  return bcrypt.compare(candidate, this.password)
}

// Address management methods
userSchema.methods.addAddress = function addAddress(addressData) {
  const newAddress = this.addresses.create(addressData)
  this.addresses.push(newAddress)
  // Set as default if it's the first address
  if (this.addresses.length === 1) {
    this.defaultAddressId = newAddress._id
  }
  return newAddress
}

userSchema.methods.updateAddress = function updateAddress(addressId, addressData) {
  const address = this.addresses.id(addressId)
  if (!address) return null
  Object.assign(address, addressData)
  return address
}

userSchema.methods.removeAddress = function removeAddress(addressId) {
  const address = this.addresses.id(addressId)
  if (!address) return false
  // If removing default address, set another as default
  if (this.defaultAddressId?.equals(addressId)) {
    this.defaultAddressId = this.addresses.find((a) => !a._id.equals(addressId))?._id || null
  }
  address.deleteOne()
  return true
}

userSchema.methods.setDefaultAddress = function setDefaultAddress(addressId) {
  const address = this.addresses.id(addressId)
  if (!address) return false
  this.defaultAddressId = addressId
  return true
}

// Sanitize: strip sensitive fields when serializing.
userSchema.methods.toJSON = function toJSON() {
  const obj = this.toObject()
  delete obj.password
  delete obj.refreshTokenHash
  delete obj.refreshTokenId
  obj.id = obj._id
  delete obj._id
  delete obj.__v
  return obj
}

export const User = mongoose.model('User', userSchema)
