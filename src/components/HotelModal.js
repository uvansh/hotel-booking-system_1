import Image from 'next/image';
import { Star, MapPin, Calendar, X } from 'lucide-react';

export default function HotelModal({ hotel, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative h-[400px] w-full">
          <Image
            src={hotel.image}
            alt={hotel.name}
            fill
            className="object-cover rounded-t-2xl"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-white/90 p-2 rounded-full hover:bg-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8">
          <h2 className="text-3xl font-bold mb-4">{hotel.name}</h2>
          <div className="flex items-center gap-2 text-gray-600 mb-4">
            <MapPin className="w-5 h-5" />
            <span className="text-lg">{hotel.location}</span>
          </div>
          <div className="flex items-center gap-1 mb-6">
            <Star className="w-6 h-6 text-yellow-400 fill-current" />
            <span className="text-lg font-medium">{hotel.rating}</span>
          </div>
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-3xl font-bold text-blue-600">${hotel.price}</p>
              <span className="text-gray-500">/night</span>
            </div>
            <button className="bg-blue-600 text-white px-8 py-3 rounded-full hover:bg-blue-700 transition-colors">
              Book Now
            </button>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">About this hotel</h3>
            <p className="text-gray-600">
              {hotel.description}
            </p>
            <div className="grid grid-cols-2 gap-4 mt-6">
              {hotel.amenities.map((amenity, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>{amenity}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 