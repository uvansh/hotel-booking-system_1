'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Search, SlidersHorizontal, Calendar, MapPin } from 'lucide-react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

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
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    rating: '',
    image: '',
    location: '',
    description: '',
    amenities: [],
    rooms: []
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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
          fetchHotels();
          fetchDestinations();
        }
      }
    }
  }, [isLoaded, isSignedIn, userId, router]);

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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Convert amenities string to array
      const amenitiesArray = formData.amenities
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');

      const hotelData = {
        ...formData,
        amenities: amenitiesArray,
        price: Number(formData.price),
        rating: Number(formData.rating),
      };

      const response = await fetch('/api/hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(hotelData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create hotel');
      }

      // Reset form and refresh hotels list
      setFormData({
        name: '',
        price: '',
        rating: '',
        image: '',
        location: '',
        description: '',
        amenities: [],
        rooms: []
      });
      fetchHotels();
    } catch (err) {
      console.error('Error creating hotel:', err);
      setError(err.message || 'Failed to create hotel');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this hotel?')) return;

    try {
      const response = await fetch(`/api/hotels/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete hotel');
      }

      fetchHotels();
    } catch (err) {
      setError(err.message);
    }
  };

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
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-4">
          <button
            onClick={() => router.push('/admin/bookings')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          >
            <Calendar className="w-5 h-5" />
            <span>Bookings</span>
          </button>
          <button
            onClick={() => router.push('/admin/destinations')}
            className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
          >
            <MapPin className="w-5 h-5" />
            <span>Destinations</span>
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span>Filters</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search hotels..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={filters.minPrice}
                  onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={filters.maxPrice}
                  onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Max"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={filters.minRating}
                  onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Min"
                />
                <input
                  type="number"
                  min="0"
                  max="5"
                  step="0.1"
                  value={filters.maxRating}
                  onChange={(e) => setFilters({ ...filters, maxRating: e.target.value })}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Max"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter location..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Add Hotel Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-2xl font-semibold mb-4">Add New Hotel</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                required
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <input
                type="number"
                name="rating"
                value={formData.rating}
                onChange={handleInputChange}
                required
                min="0"
                max="5"
                step="0.1"
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="3"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amenities (comma-separated)</label>
            <input
              type="text"
              name="amenities"
              value={formData.amenities}
              onChange={handleInputChange}
              placeholder="e.g., WiFi, Pool, Parking"
              className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Adding...' : 'Add Hotel'}
          </button>
        </form>
      </div>

      {/* Hotels List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Location</th>
                <th className="text-left py-3 px-4">Price</th>
                <th className="text-left py-3 px-4">Rating</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredHotels.map((hotel) => (
                <tr key={hotel._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{hotel.name}</td>
                  <td className="py-3 px-4">{hotel.location}</td>
                  <td className="py-3 px-4">${hotel.price}</td>
                  <td className="py-3 px-4">{hotel.rating} / 5</td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => handleDelete(hotel._id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 