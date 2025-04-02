'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { Star, Calendar, Clock, MapPin, Users, CheckCircle, Building2, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function MyBookings() {
  const { isSignedIn, userId } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRatings, setUserRatings] = useState({});
  const [isRating, setIsRating] = useState({});
  const [ratingError, setRatingError] = useState({});
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    console.log('Auth state:', { isSignedIn, userId });
    if (isSignedIn) {
      fetchBookings();
    }
  }, [isSignedIn]);

  const fetchBookings = async () => {
    console.log('Fetching bookings...');
    try {
      const response = await fetch('/api/bookings');
      const data = await response.json();
      console.log('Bookings data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }
      setBookings(data);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRatingSubmit = async (hotelId, rating) => {
    setIsRating(prev => ({ ...prev, [hotelId]: true }));
    setRatingError(prev => ({ ...prev, [hotelId]: null }));

    try {
      const response = await fetch(`/api/hotels/${hotelId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit rating');
      }

      setUserRatings(prev => ({ ...prev, [hotelId]: rating }));
      fetchBookings();
    } catch (err) {
      console.error('Rating error:', err);
      setRatingError(prev => ({ ...prev, [hotelId]: err.message }));
    } finally {
      setIsRating(prev => ({ ...prev, [hotelId]: false }));
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Please sign in to view your bookings
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-center items-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900">Error</h2>
            <p className="mt-2 text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">My Bookings</h2>
            <p className="mt-2 text-gray-600">Manage and review your hotel bookings</p>
          </div>
          <div className="flex gap-4">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="all">All Bookings</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-medium text-gray-900">No bookings found</h3>
            <p className="mt-2 text-gray-500">You haven&apos;t made any bookings yet.</p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Browse Hotels
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div
                key={booking._id}
                className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="flex flex-col md:flex-row">
                  <div className="md:w-1/3">
                    <img
                      src={booking.hotel?.image || '/placeholder.jpg'}
                      alt={booking.hotel?.name || 'Hotel'}
                      className="w-full h-48 md:h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900">
                          {booking.hotel?.name || 'Unnamed Hotel'}
                        </h3>
                        <div className="flex items-center mt-1 text-gray-600">
                          <MapPin className="w-4 h-4 mr-1" />
                          <span>{booking.hotel?.location || 'Location not specified'}</span>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>

                    <div className="mt-6 grid grid-cols-2 gap-4">
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-5 h-5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Check-in</p>
                          <p>{new Date(booking.checkIn).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Calendar className="w-5 h-5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Check-out</p>
                          <p>{new Date(booking.checkOut).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Users className="w-5 h-5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Guests</p>
                          <p>{booking.guests} people</p>
                        </div>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <DollarSign className="w-5 h-5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-gray-500">Price per night</p>
                          <p>${booking.hotel?.price || 0}</p>
                        </div>
                      </div>
                    </div>

                    {/* Rating Section - Only show for completed bookings */}
                    {booking.status === 'completed' && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">Rate your stay</h4>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRatingSubmit(booking.hotel._id, star)}
                              disabled={isRating[booking.hotel._id]}
                              className={`focus:outline-none transition-colors ${
                                star <= (userRatings[booking.hotel._id] || 0)
                                  ? 'text-yellow-400'
                                  : 'text-gray-300'
                              } hover:text-yellow-400`}
                              aria-label={`Rate ${star} stars`}
                            >
                              <Star className="w-6 h-6" />
                            </button>
                          ))}
                        </div>
                        {ratingError[booking.hotel._id] && (
                          <p className="text-red-500 text-sm mt-2">
                            {ratingError[booking.hotel._id]}
                          </p>
                        )}
                        {isRating[booking.hotel._id] && (
                          <p className="text-gray-500 text-sm mt-2">Submitting rating...</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 