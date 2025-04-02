'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Star, Calendar, Clock, MapPin, Users, Building2, DollarSign } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function UserBookings() {
  const { isSignedIn, isLoaded } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userRatings, setUserRatings] = useState({});
  const [isRating, setIsRating] = useState({});
  const [ratingError, setRatingError] = useState({});
  const [filter, setFilter] = useState('all');

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/bookings');
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      router.push('/sign-in');
      return;
    }

    fetchBookings();
  }, [isSignedIn, isLoaded, router]);

  // Initialize userRatings from bookings data
  useEffect(() => {
    if (bookings.length > 0) {
      const ratings = {};
      bookings.forEach(booking => {
        if (booking.userRating) {
          ratings[booking.hotel._id] = booking.userRating;
        }
      });
      setUserRatings(ratings);
    }
  }, [bookings]);

  const handleRatingSubmit = async (hotelId, rating) => {
    // Check if user has already rated this hotel
    if (userRatings[hotelId]) {
      setRatingError(prev => ({ ...prev, [hotelId]: 'You have already rated this hotel' }));
      return;
    }

    setIsRating(prev => ({ ...prev, [hotelId]: true }));
    setRatingError(prev => ({ ...prev, [hotelId]: null }));

    try {
      console.log('Submitting rating:', { hotelId, rating });
      const response = await fetch(`/api/hotels/${hotelId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rating }),
      });

      const data = await response.json();
      console.log('Rating API response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit rating');
      }

      // Update local state to mark this hotel as rated
      setUserRatings(prev => ({ ...prev, [hotelId]: rating }));
      
      // Update the hotel rating in the bookings list
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.hotel._id === hotelId
            ? {
                ...booking,
                userRating: rating,
                hotel: {
                  ...booking.hotel,
                  rating: data.newRating
                }
              }
            : booking
        )
      );
    } catch (err) {
      console.error('Rating error details:', err);
      setRatingError(prev => ({ ...prev, [hotelId]: err.message }));
    } finally {
      setIsRating(prev => ({ ...prev, [hotelId]: false }));
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (!isLoaded) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
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
                    <div className="relative h-48 md:h-full w-full">
                      <Image
                        src={booking.hotel?.image || '/placeholder.jpg'}
                        alt={booking.hotel?.name || 'Hotel'}
                        fill
                        className="object-cover rounded-lg"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      />
                    </div>
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

                    {/* Rating Section */}
                    {booking.status === 'completed' && (
                      <div className="mt-4 border-t pt-4">
                        {userRatings[booking.hotel._id] ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <Star className="w-5 h-5 text-yellow-400 fill-current" />
                            <p className="text-sm">
                              You rated this hotel {userRatings[booking.hotel._id]} stars
                            </p>
                          </div>
                        ) : (
                          <>
                            <h4 className="text-sm font-medium text-gray-700 mb-2">Rate your stay</h4>
                            <div className="flex items-center gap-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  onClick={() => handleRatingSubmit(booking.hotel._id, star)}
                                  disabled={isRating[booking.hotel._id]}
                                  className={`p-1 rounded-full hover:bg-gray-100 transition-colors ${
                                    isRating[booking.hotel._id] ? 'cursor-wait' : 'cursor-pointer'
                                  }`}
                                >
                                  <Star
                                    className={`w-5 h-5 ${
                                      star <= booking.hotel.rating
                                        ? 'text-yellow-400 fill-current'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                </button>
                              ))}
                            </div>
                            {ratingError[booking.hotel._id] && (
                              <p className="mt-2 text-sm text-red-600">
                                {ratingError[booking.hotel._id]}
                              </p>
                            )}
                            {isRating[booking.hotel._id] && (
                              <p className="mt-2 text-sm text-gray-500">
                                Submitting rating...
                              </p>
                            )}
                          </>
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