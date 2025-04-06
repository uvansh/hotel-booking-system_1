'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, SlidersHorizontal, Calendar, MapPin, Pencil, Building2 } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { toast } from "sonner";

export default function AdminDashboard() {
  const { isLoaded, userId, isSignedIn } = useAuth();
  const router = useRouter();
  const [hotels, setHotels] = useState([]);
  const [destinations, setDestinations] = useState([]);
  const [filteredHotels, setFilteredHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    maxRating: '',
    location: '',
  });

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/admin/signup');
      } else {
        // Check if user is admin
        checkAdminStatus();
      }
    }
  }, [isLoaded, isSignedIn, userId, router]);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch('/api/admin/check', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Not an admin');
      }

      // If we get here, user is admin
      fetchHotels();
      fetchDestinations();
    } catch (error) {
      console.error('Admin check failed:', error);
      router.push('/');
    }
  };

  const fetchDestinations = async () => {
    try {
      const response = await fetch('/api/destinations');
      if (!response.ok) throw new Error('Failed to fetch destinations');
      const data = await response.json();
      setDestinations(data);
    } catch (err) {
      console.error('Error fetching destinations:', err);
      setError('Failed to load destinations');
    }
  };

  useEffect(() => {
    // Apply filters whenever hotels or filters change
    let filtered = [...hotels];

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(hotel => 
        hotel.name.toLowerCase().includes(searchTerm) ||
        hotel.location.toLowerCase().includes(searchTerm)
      );
    }

    // Price range filter
    if (filters.minPrice) {
      filtered = filtered.filter(hotel => hotel.price >= Number(filters.minPrice));
    }
    if (filters.maxPrice) {
      filtered = filtered.filter(hotel => hotel.price <= Number(filters.maxPrice));
    }

    // Rating range filter
    if (filters.minRating) {
      filtered = filtered.filter(hotel => hotel.rating >= Number(filters.minRating));
    }
    if (filters.maxRating) {
      filtered = filtered.filter(hotel => hotel.rating <= Number(filters.maxRating));
    }

    // Location filter
    if (filters.location) {
      filtered = filtered.filter(hotel => 
        hotel.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    setFilteredHotels(filtered);
  }, [hotels, filters]);

  const fetchHotels = async () => {
    try {
      const response = await fetch('/api/hotels');
      if (!response.ok) throw new Error('Failed to fetch hotels');
      const data = await response.json();
      setHotels(data);
    } catch (error) {
      toast.error("Failed to fetch hotels. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return;

    try {
      const response = await fetch(`/api/hotels/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete hotel');

      setHotels(hotels.filter(hotel => hotel._id !== id));
      toast.success("Hotel deleted successfully");
    } catch (error) {
      toast.error("Failed to delete hotel. Please try again.");
    }
  };

  const handleEdit = (id) => {
    router.push(`/admin/hotels/${id}/edit`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => router.push('/admin/hotels/add')}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
              >
                <Plus className="w-5 h-5" />
                <span>Add Hotel</span>
              </button>
              <button
                onClick={() => router.push('/admin/bookings')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors shadow-sm"
              >
                <Calendar className="w-5 h-5" />
                <span>Bookings</span>
              </button>
              <button
                onClick={() => router.push('/admin/destinations')}
                className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors shadow-sm"
              >
                <MapPin className="w-5 h-5" />
                <span>Destinations</span>
              </button>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors shadow-sm"
              >
                <SlidersHorizontal className="w-5 h-5" />
                <span>Filters</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Filters Panel */}
        {showFilters && (
          <div className="bg-white p-6 rounded-lg shadow-md mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Filter Hotels</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Search hotels..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={filters.minPrice}
                    onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    value={filters.maxPrice}
                    onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Max"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating Range</label>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={filters.minRating}
                    onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Min"
                  />
                  <input
                    type="number"
                    min="0"
                    max="5"
                    step="0.1"
                    value={filters.maxRating}
                    onChange={(e) => setFilters({ ...filters, maxRating: e.target.value })}
                    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Max"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <input
                  type="text"
                  value={filters.location}
                  onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter location..."
                />
              </div>
            </div>
          </div>
        )}

        {/* Hotels Section */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Hotels Management</h2>
          </div>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHotels.map((hotel) => (
                <div key={hotel._id} className="bg-white rounded-lg shadow-md overflow-hidden">
                  <div className="relative aspect-video">
                    {hotel.image ? (
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                        <Building2 className="w-12 h-12 text-gray-400" />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => handleEdit(hotel._id)}
                        className="p-2 bg-white/90 rounded-full hover:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <Pencil className="w-5 h-5 text-blue-600" />
                      </button>
                      <button
                        onClick={() => handleDelete(hotel._id)}
                        className="p-2 bg-white/90 rounded-full hover:bg-white focus:outline-none focus:ring-2 focus:ring-red-500"
                      >
                        <Trash2 className="w-5 h-5 text-red-600" />
                      </button>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{hotel.name}</h3>
                    <p className="text-gray-600 mb-2">{hotel.location}</p>
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-blue-600 font-semibold">${hotel.price}/night</span>
                      <span className="text-yellow-500">★ {hotel.rating}</span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-3">
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-600">Discount:</label>
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={hotel.discountPercentage || 0}
                          onChange={(e) => {
                            const newDiscount = Math.min(100, Math.max(0, parseInt(e.target.value) || 0));
                            setHotels(hotels.map(h => 
                              h._id === hotel._id 
                                ? { ...h, discountPercentage: newDiscount }
                                : h
                            ));
                          }}
                          className="w-16 px-2 py-1 border rounded-md text-sm"
                        />
                        <span className="text-sm text-gray-600">%</span>
                        <button
                          onClick={async () => {
                            try {
                              const response = await fetch(`/api/hotels/${hotel._id}`, {
                                method: 'PATCH',
                                headers: {
                                  'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                  discountPercentage: hotel.discountPercentage || 0
                                }),
                              });
                              
                              if (!response.ok) {
                                const errorData = await response.json();
                                throw new Error(errorData.error || 'Failed to update discount');
                              }
                              
                              const data = await response.json();
                              // Update the local state with the updated hotel data
                              setHotels(hotels.map(h => 
                                h._id === hotel._id 
                                  ? { ...h, discountPercentage: data.hotel.discountPercentage }
                                  : h
                              ));
                              
                              toast.success("Discount updated successfully");
                            } catch (error) {
                              console.error('Error updating discount:', error);
                              toast.error(error.message || "Failed to update discount");
                            }
                          }}
                          className="px-2 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                        >
                          Save
                        </button>
                      </div>
                      {hotel.discountPercentage > 0 && (
                        <span className="text-sm text-green-600">
                          ${Math.round(hotel.price * (1 - hotel.discountPercentage / 100))} after discount
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 