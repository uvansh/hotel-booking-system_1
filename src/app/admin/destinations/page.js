'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, Search, SlidersHorizontal, Edit2 } from 'lucide-react';

export default function AdminDestinations() {
  const { isLoaded, isSignedIn, userId } = useAuth();
  const router = useRouter();
  const [destinations, setDestinations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    country: '',
  });
  const [formData, setFormData] = useState({
    name: '',
    country: '',
    description: '',
    image: '',
    rating: '',
    hotelCount: '',
    popularAttractions: '',
    climate: '',
    bestTimeToVisit: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (isLoaded) {
      if (!isSignedIn) {
        router.push('/admin/signup');
      } else {
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
      fetchDestinations();
    } catch (error) {
      console.error('Admin check failed:', error);
      router.push('/');
    }
  };

  const fetchDestinations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/destinations');
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch destinations');
      }

      setDestinations(data);
    } catch (err) {
      console.error('Error fetching destinations:', err);
      setError(err.message || 'Failed to fetch destinations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      // Validate required fields
      const requiredFields = ['name', 'country', 'description', 'image', 'rating', 'hotelCount', 'popularAttractions', 'climate', 'bestTimeToVisit'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      }

      // Validate rating range
      const rating = Number(formData.rating);
      if (isNaN(rating) || rating < 0 || rating > 5) {
        throw new Error('Rating must be between 0 and 5');
      }

      // Validate hotel count
      const hotelCount = Number(formData.hotelCount);
      if (isNaN(hotelCount) || hotelCount < 0) {
        throw new Error('Hotel count must be a positive number');
      }

      const data = {
        ...formData,
        popularAttractions: formData.popularAttractions.split(',').map(attraction => attraction.trim()),
        rating,
        hotelCount,
      };

      const url = editingId ? `/api/destinations/${editingId}` : '/api/destinations';
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to save destination');
      }

      // Reset form and refresh destinations
      setFormData({
        name: '',
        country: '',
        description: '',
        image: '',
        rating: '',
        hotelCount: '',
        popularAttractions: '',
        climate: '',
        bestTimeToVisit: '',
      });
      setEditingId(null);
      fetchDestinations();
    } catch (err) {
      console.error('Error saving destination:', err);
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (destination) => {
    setFormData({
      name: destination.name,
      country: destination.country,
      description: destination.description,
      image: destination.image,
      rating: destination.rating,
      hotelCount: destination.hotelCount,
      popularAttractions: destination.popularAttractions.join(', '),
      climate: destination.climate,
      bestTimeToVisit: destination.bestTimeToVisit,
    });
    setEditingId(destination._id);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this destination?')) return;

    try {
      const response = await fetch(`/api/destinations/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete destination');
      }

      fetchDestinations();
    } catch (err) {
      console.error('Error deleting destination:', err);
      setError(err.message);
    }
  };

  const filteredDestinations = destinations.filter(destination => {
    if (filters.search && !destination.name.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }
    if (filters.country && !destination.country.toLowerCase().includes(filters.country.toLowerCase())) {
      return false;
    }
    return true;
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
        <h1 className="text-3xl font-bold">Manage Destinations</h1>
        <div className="flex gap-4">
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search by name
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search destinations..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Filter by country
              </label>
              <input
                type="text"
                value={filters.country}
                onChange={(e) => setFilters({ ...filters, country: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter country..."
              />
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Form */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <h2 className="text-xl font-semibold mb-4">
          {editingId ? 'Edit Destination' : 'Add New Destination'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                type="url"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Rating (0-5)
              </label>
              <input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Hotel Count
              </label>
              <input
                type="number"
                min="0"
                value={formData.hotelCount}
                onChange={(e) => setFormData({ ...formData, hotelCount: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Climate
              </label>
              <input
                type="text"
                value={formData.climate}
                onChange={(e) => setFormData({ ...formData, climate: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Best Time to Visit
              </label>
              <input
                type="text"
                value={formData.bestTimeToVisit}
                onChange={(e) => setFormData({ ...formData, bestTimeToVisit: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Popular Attractions (comma-separated)
              </label>
              <input
                type="text"
                value={formData.popularAttractions}
                onChange={(e) => setFormData({ ...formData, popularAttractions: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Eiffel Tower, Louvre Museum, Notre-Dame"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                required
              />
            </div>
          </div>
          <div className="flex justify-end gap-4">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setFormData({
                    name: '',
                    country: '',
                    description: '',
                    image: '',
                    rating: '',
                    hotelCount: '',
                    popularAttractions: '',
                    climate: '',
                    bestTimeToVisit: '',
                  });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : editingId ? 'Update Destination' : 'Add Destination'}
            </button>
          </div>
        </form>
      </div>

      {/* Destinations List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-left py-3 px-4">Name</th>
                <th className="text-left py-3 px-4">Country</th>
                <th className="text-left py-3 px-4">Rating</th>
                <th className="text-left py-3 px-4">Hotels</th>
                <th className="text-left py-3 px-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDestinations.map((destination) => (
                <tr key={destination._id} className="border-b hover:bg-gray-50">
                  <td className="py-3 px-4">{destination.name}</td>
                  <td className="py-3 px-4">{destination.country}</td>
                  <td className="py-3 px-4">{destination.rating} / 5</td>
                  <td className="py-3 px-4">{destination.hotelCount}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(destination)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(destination._id)}
                        className="text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
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