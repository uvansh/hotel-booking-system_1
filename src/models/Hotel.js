import mongoose from 'mongoose';

const HotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a hotel name'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
    min: [0, 'Price cannot be negative'],
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
  },
  image: {
    type: String,
    required: [true, 'Please provide an image URL'],
  },
  location: {
    type: String,
    required: [true, 'Please provide a location'],
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  destination: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Destination',
  },
  amenities: [{
    type: String,
  }],
  rooms: [{
    type: {
      type: String,
      required: true,
    },
    price: {
      type: Number,
      required: true,
      min: [0, 'Price cannot be negative'],
    },
    capacity: {
      type: Number,
      required: true,
      min: [1, 'Capacity must be at least 1'],
    },
    description: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
HotelSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema); 