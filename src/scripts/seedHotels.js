import connectDB from '@/lib/mongodb';
import Hotel from '@/models/Hotel';

const hotels = [
  {
    name: "Luxury Resort & Spa",
    price: 299,
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000&auto=format&fit=crop",
    location: "Maldives",
    description: "Experience ultimate luxury in our beachfront resort. Enjoy world-class spa treatments, gourmet dining, and pristine beaches.",
    amenities: ["Free WiFi", "Swimming Pool", "24/7 Reception", "Parking Available", "Spa", "Restaurant", "Beach Access"]
  },
  {
    name: "Mountain View Lodge",
    price: 199,
    rating: 4.6,
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000&auto=format&fit=crop",
    location: "Swiss Alps",
    description: "Nestled in the heart of the Swiss Alps, our lodge offers breathtaking mountain views and cozy accommodations.",
    amenities: ["Free WiFi", "Ski Storage", "Restaurant", "Spa", "Mountain View", "Fireplace", "Parking Available"]
  },
  {
    name: "Beachfront Villa",
    price: 399,
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000&auto=format&fit=crop",
    location: "Bali",
    description: "Your private paradise awaits in our beachfront villa. Enjoy direct beach access and stunning ocean views.",
    amenities: ["Private Pool", "Beach Access", "Free WiFi", "Kitchen", "Air Conditioning", "Ocean View", "Parking"]
  },
  {
    name: "City Center Hotel",
    price: 149,
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000&auto=format&fit=crop",
    location: "New York",
    description: "Located in the heart of Manhattan, our hotel offers easy access to all major attractions and business districts.",
    amenities: ["Free WiFi", "Fitness Center", "Business Center", "Restaurant", "24/7 Reception", "Parking Available"]
  }
];

async function seedHotels() {
  try {
    await connectDB();
    await Hotel.deleteMany({}); // Clear existing hotels
    await Hotel.insertMany(hotels);
    console.log('Database seeded successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seedHotels(); 