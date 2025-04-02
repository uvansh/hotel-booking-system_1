'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import { MapPin, Star, Calendar, Thermometer, Building2, ChevronLeft, ChevronRight } from 'lucide-react';

export default function DestinationDetails() {
  const params = useParams();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    const fetchDestination = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await fetch(`/api/destinations/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch destination details');
        }

        setDestination(data);
      } catch (err) {
        console.error('Error fetching destination:', err);
        setError(err.message || 'Failed to load destination details');
      } finally {
        setLoading(false);
      }
    };

    fetchDestination();
  }, [params.id]);

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % destination.images.length);
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + destination.images.length) % destination.images.length);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-gray-600">
          Destination not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="relative h-[500px] rounded-lg overflow-hidden mb-8">
        <Image
          src={destination.image}
          alt={destination.name}
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/40 flex items-center justify-center">
          <div className="text-center text-white">
            <h1 className="text-5xl font-bold mb-4">{destination.name}</h1>
            <div className="flex items-center justify-center gap-2 text-lg">
              <MapPin className="w-6 h-6" />
              <span>{destination.country}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column - Main Info */}
        <div className="md:col-span-2 space-y-8">
          {/* Description */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">About</h2>
            <p className="text-gray-600 leading-relaxed">{destination.description}</p>
          </div>

          {/* Popular Attractions */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Popular Attractions</h2>
            <ul className="space-y-2">
              {destination.popularAttractions.map((attraction, index) => (
                <li key={index} className="flex items-center gap-2 text-gray-600">
                  <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                  {attraction}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column - Side Info */}
        <div className="space-y-6">
          {/* Rating */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-5 h-5 text-yellow-400" />
              <span className="text-xl font-semibold">{destination.rating} / 5</span>
            </div>
            <p className="text-gray-600">Based on visitor reviews</p>
          </div>

          {/* Hotel Count */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-blue-500" />
              <span className="text-xl font-semibold">{destination.hotelCount}</span>
            </div>
            <p className="text-gray-600">Available hotels</p>
          </div>

          {/* Climate */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="w-5 h-5 text-red-500" />
              <span className="text-xl font-semibold">{destination.climate}</span>
            </div>
            <p className="text-gray-600">Typical weather conditions</p>
          </div>

          {/* Best Time to Visit */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-5 h-5 text-green-500" />
              <span className="text-xl font-semibold">{destination.bestTimeToVisit}</span>
            </div>
            <p className="text-gray-600">Recommended visiting period</p>
          </div>
        </div>
      </div>
    </div>
  );
} 