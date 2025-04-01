import mongoose from 'mongoose';

const HotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a hotel name'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: 0,
    max: 5,
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
  amenities: [{
    type: String,
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema); 