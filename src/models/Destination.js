import mongoose from 'mongoose';

const destinationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  country: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 0,
    max: 5,
  },
  hotelCount: {
    type: Number,
    required: true,
    default: 0,
  },
  popularAttractions: [{
    type: String,
    trim: true,
  }],
  climate: {
    type: String,
    required: true,
  },
  bestTimeToVisit: {
    type: String,
    required: true,
  },
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
destinationSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const Destination = mongoose.models.Destination || mongoose.model('Destination', destinationSchema);

export default Destination; 