'use client';

import Image from 'next/image';
import { Star, MapPin, Calendar } from 'lucide-react';
import { useState, useEffect } from 'react';
import HotelModal from '@/components/HotelModal';

export default function Home() {
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await fetch('/api/hotels');
        if (!response.ok) {
          throw new Error('Failed to fetch hotels');
        }
        const data = await response.json();
        setHotels(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, []);

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Banner Section */}
      <div className="relative h-[600px] w-full">
        <Image
          src="https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=2070&auto=format&fit=crop"
          alt="Hotel Banner"
          fill
          className="object-cover brightness-50"
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
              <input type="text" placeholder="Where to?" className="bg-transparent outline-none text-white placeholder-white/70" />
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <input type="date" className="bg-transparent outline-none text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Hotel Grid Section */}
      <div className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold mb-12 text-center animate-fade-in">
          Featured Hotels
        </h2>
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
            {hotels.map((hotel, index) => (
              <div
                key={hotel._id}
                onClick={() => setSelectedHotel(hotel)}
                className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group hover:-translate-y-1 animate-fade-in-up cursor-pointer"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={hotel.image}
                    alt={hotel.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6">
                  <h3 className="font-semibold text-xl mb-2 group-hover:text-blue-600 transition-colors">{hotel.name}</h3>
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm">{hotel.location}</span>
                  </div>
                  <div className="flex items-center gap-1 mb-4">
                    <Star className="w-5 h-5 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium">{hotel.rating}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-2xl font-bold text-blue-600">${hotel.price}</p>
                    <span className="text-sm text-gray-500">/night</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedHotel && (
        <HotelModal
          hotel={selectedHotel}
          onClose={() => setSelectedHotel(null)}
        />
      )}
    </main>
  );
}
