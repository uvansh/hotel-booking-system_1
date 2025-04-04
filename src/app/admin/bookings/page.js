'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, Users, CheckCircle, Building2 } from 'lucide-react';

export default function ManageBookings() {
  const { isLoaded, userId, isSignedIn } = useAuth();
  const router = useRouter();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingStatus, setUpdatingStatus] = useState({});
  const [statusError, setStatusError] = useState({});
  const [filter, setFilter] = useState('all'); // all, pending, completed, cancelled
  const [cancellingBooking, setCancellingBooking] = useState({});
  const [cancellationError, setCancellationError] = useState({});

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/admin/signup');
      } else {
        // Check if user is admin
        const adminUserIds = process.env.NEXT_PUBLIC_ADMIN_USER_IDS?.split(',') || [];
        if (!adminUserIds.includes(userId)) {
          router.push('/');
        } else {
          fetchBookings();
        }
      }
    }
  }, [isLoaded, isSignedIn, userId, router]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/admin/bookings');
      const data = await response.json();
      
      console.log('API Response:', response);
      console.log('Bookings Data:', data);
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch bookings');
      }

      if (!Array.isArray(data)) {
        throw new Error('Invalid bookings data received');
      }

      // Transform the data to match the expected structure
      const transformedBookings = data.map(booking => ({
        ...booking,
        guests: booking.numberOfGuests, // Map numberOfGuests to guests
        hotel: booking.hotelId // Map hotelId to hotel
      }));

      setBookings(transformedBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setUpdatingStatus(prev => ({ ...prev, [bookingId]: true }));
    setStatusError(prev => ({ ...prev, [bookingId]: null }));

    try {
      const response = await fetch(`/api/admin/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update booking status');
      }

      // Refresh bookings to get updated status
      fetchBookings();
    } catch (err) {
      console.error('Status update error:', err);
      setStatusError(prev => ({ ...prev, [bookingId]: err.message }));
    } finally {
      setUpdatingStatus(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const handleCancelBooking = async (bookingId) => {
    setCancellingBooking(prev => ({ ...prev, [bookingId]: true }));
    setCancellationError(prev => ({ ...prev, [bookingId]: null }));

    try {
      const response = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          bookingId,
          status: 'cancelled' 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to cancel booking');
      }

      // Refresh bookings to get updated status
      fetchBookings();
    } catch (err) {
      console.error('Cancellation error:', err);
      setCancellationError(prev => ({ ...prev, [bookingId]: err.message }));
    } finally {
      setCancellingBooking(prev => ({ ...prev, [bookingId]: false }));
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filter === 'all') return true;
    return booking.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Manage Bookings</h1>
        <div className="flex gap-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Bookings</option>
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          <p className="font-medium">Error:</p>
          <p>{error}</p>
        </div>
      )}

      {!loading && bookings.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-900">No bookings found</h3>
          <p className="mt-2 text-gray-500">
            {filter === 'all' 
              ? 'There are no bookings to manage.'
              : `No ${filter} bookings found.`}
          </p>
          <div className="mt-4">
            <button
              onClick={fetchBookings}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Try refreshing
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center min-h-[200px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredBookings.map((booking) => (
            <div
              key={booking._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <div className="relative h-48">
                {booking.hotel?.image ? (
                  <img
                    src={booking.hotel.image}
                    alt={booking.hotel.name || 'Hotel'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <Building2 className="w-12 h-12 text-gray-400" />
                  </div>
                )}
                <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-sm font-medium">
                  {booking.hotel?.discountPercentage > 0 ? (
                    <>
                      <span className="line-through text-gray-400 mr-1">${booking.hotel?.price || 0}</span>
                      <span className="text-green-600">${Math.round(booking.hotel?.price * (1 - (booking.hotel?.discountPercentage || 0) / 100)) || 0}</span>
                    </>
                  ) : (
                    `$${booking.hotel?.price || 0}`
                  )}/night
                </div>
                <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-sm font-medium ${
                  booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                  booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">
                  {booking.hotel?.name || 'Unnamed Hotel'}
                </h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 mr-2" />
                    <span>{booking.hotel?.location || 'Location not specified'}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {new Date(booking.checkIn).toLocaleDateString()} -{' '}
                      {new Date(booking.checkOut).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{booking.guests} guests</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>Booked on {new Date(booking.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                {booking.status === 'pending' && (
                  <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                    <button
                      onClick={() => handleStatusUpdate(booking._id, 'completed')}
                      disabled={updatingStatus[booking._id]}
                      className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {updatingStatus[booking._id] ? (
                        'Updating...'
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Mark as Completed
                        </>
                      )}
                    </button>
                    
                    <button
                      onClick={() => handleCancelBooking(booking._id)}
                      disabled={cancellingBooking[booking._id]}
                      className="w-full flex items-center justify-center gap-2 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {cancellingBooking[booking._id] ? (
                        'Cancelling...'
                      ) : (
                        <>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          Cancel Booking
                        </>
                      )}
                    </button>
                    {statusError[booking._id] && (
                      <p className="text-red-500 text-sm">
                        {statusError[booking._id]}
                      </p>
                    )}
                    {cancellationError[booking._id] && (
                      <p className="text-red-500 text-sm">
                        {cancellationError[booking._id]}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 