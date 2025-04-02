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
    default: 0,
    min: [0, 'Rating cannot be less than 0'],
    max: [5, 'Rating cannot be more than 5'],
  },
  ratings: [{
    userId: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be more than 5']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
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

// Calculate average rating before saving
HotelSchema.pre('save', function(next) {
  if (this.ratings && this.ratings.length > 0) {
    const sum = this.ratings.reduce((acc, curr) => acc + curr.rating, 0);
    this.rating = sum / this.ratings.length;
  }
  next();
});

export default mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema); 