import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables
config();

// Define the Hotel schema
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
  amenities: [{
    type: String,
  }],
});

// Create the model
const Hotel = mongoose.models.Hotel || mongoose.model('Hotel', HotelSchema);

const hotels = [
  {
    name: "Luxury Resort & Spa",
    price: 299,
    rating: 4.8,
    image: "https://a0.muscache.com/im/pictures/miso/Hosting-964577283039581384/original/7a80a62a-11f0-4dc6-a55e-5811e8dbb474.png?im_w=1200",
    location: "Maldives",
    description: "Experience ultimate luxury in our beachfront resort. Enjoy world-class spa treatments, gourmet dining, and pristine beaches.",
    amenities: ["Free WiFi", "Swimming Pool", "24/7 Reception", "Parking Available", "Spa", "Restaurant", "Beach Access"]
  },
  {
    name: "Mountain View Lodge",
    price: 199,
    rating: 4.6,
    image: "https://a0.muscache.com/im/pictures/9a77b367-e01a-45be-9c3c-9d8e8e052e4d.jpg?im_w=720",
    location: "Swiss Alps",
    description: "Nestled in the heart of the Swiss Alps, our lodge offers breathtaking mountain views and cozy accommodations.",
    amenities: ["Free WiFi", "Ski Storage", "Restaurant", "Spa", "Mountain View", "Fireplace", "Parking Available"]
  },
  {
    name: "Beachfront Villa",
    price: 399,
    rating: 4.9,
    image: "https://a0.muscache.com/im/pictures/789aadf9-487f-4b1c-9ea4-e891a5c40528.jpg?im_w=720",
    location: "Bali",
    description: "Your private paradise awaits in our beachfront villa. Enjoy direct beach access and stunning ocean views.",
    amenities: ["Private Pool", "Beach Access", "Free WiFi", "Kitchen", "Air Conditioning", "Ocean View", "Parking"]
  },
  {
    name: "City Center Hotel",
    price: 149,
    rating: 4.5,
    image: "https://a0.muscache.com/im/pictures/miso/Hosting-36629436/original/be745f65-f854-45fb-8810-ccdc9040c168.jpeg?im_w=720",
    location: "New York",
    description: "Located in the heart of Manhattan, our hotel offers easy access to all major attractions and business districts.",
    amenities: ["Free WiFi", "Fitness Center", "Business Center", "Restaurant", "24/7 Reception", "Parking Available"]
  }
];

async function connectDB() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function seedHotels() {
  try {
    await connectDB();
    
    // Get existing hotel names
    const existingHotels = await Hotel.find({}, 'name');
    const existingHotelNames = new Set(existingHotels.map(hotel => hotel.name));
    
    // Filter out hotels that already exist
    const newHotels = hotels.filter(hotel => !existingHotelNames.has(hotel.name));
    
    if (newHotels.length === 0) {
      console.log('All hotels already exist in the database. No new hotels added.');
      await mongoose.disconnect();
      process.exit(0);
      return;
    }

    // Insert only new hotels
    await Hotel.insertMany(newHotels);
    console.log(`Successfully added ${newHotels.length} new hotels to the database`);
    console.log('New hotels added:', newHotels.map(hotel => hotel.name).join(', '));
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

seedHotels(); 