'use client';

import Image from 'next/image';
import { MapPin, SlidersHorizontal, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import HotelCard from '@/components/HotelCard';

export default function Home() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    minRating: '',
    location: ''
  });

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await fetch('/api/hotels');
      if (!response.ok) throw new Error('Failed to fetch hotels');
      const data = await response.json();
      setHotels(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredHotels = hotels.filter(hotel => {
    const price = parseInt(hotel.price);
    const rating = parseFloat(hotel.rating);
    return (
      (!filters.minPrice || price >= parseInt(filters.minPrice)) &&
      (!filters.maxPrice || price <= parseInt(filters.maxPrice)) &&
      (!filters.minRating || rating >= parseFloat(filters.minRating)) &&
      (!filters.location || hotel.location.toLowerCase().includes(filters.location.toLowerCase()))
    );
  });

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <div className="relative h-[600px] w-full">
        <Image
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop"
          alt="Hotel Banner"
          fill
          className="object-cover brightness-70"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/20" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white px-4">
          <h1 className="text-6xl font-bold mb-6 text-center animate-fade-in">
            Find Your Perfect Stay
          </h1>
          <p className="text-xl text-center max-w-2xl mb-8 animate-fade-in-delay">
            Discover amazing hotels at unbeatable prices. Book your next adventure today.
          </p>
          <div className="flex gap-4 bg-white/10 backdrop-blur-sm p-4 rounded-full animate-fade-in-delay-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              <input 
                type="text" 
                placeholder="Where you want to go?" 
                className="bg-transparent outline-none text-white placeholder-white/70"
                value={filters.location}
                onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
              />
              <Search className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Grid Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-4xl font-bold animate-fade-in">Featured Hotels</h2>
          <div className="flex gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Price</label>
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="$0"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Max Price</label>
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="$1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Min Rating</label>
                <input
                  type="number"
                  value={filters.minRating}
                  onChange={(e) => setFilters(prev => ({ ...prev, minRating: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                  min="0"
                  max="5"
                  step="0.1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location"
                />
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-600">
            <p>Error: {error}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {filteredHotels.map((hotel) => (
              <HotelCard key={hotel._id} hotel={hotel} />
            ))}
          </div>
        )}
      </div>

      {/* Footer Section */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4 italic">Nestio.</h3>
              <p className="text-gray-400">Find your perfect stay with our extensive collection of hotels worldwide.</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><a href="/about" className="text-gray-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="/contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="/comming-soon" className="text-gray-400 hover:text-white transition-colors">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Support</h4>
              <ul className="space-y-2">
                <li><a href="/comming-soon" className="text-gray-400 hover:text-white transition-colors">Help Center</a></li>
                <li><a href="/comming-soon" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="/comming-soon" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
              <ul className="space-y-2">
                <li><a href="https://www.facebook.com/" className="text-gray-400 hover:text-white transition-colors">Facebook</a></li>
                <li><a href="https://x.com" className="text-gray-400 hover:text-white transition-colors">X Twitter</a></li>
                <li><a href="https://www.instagram.com/" className="text-gray-400 hover:text-white transition-colors">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; {new Date().getFullYear()} Nestio. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
