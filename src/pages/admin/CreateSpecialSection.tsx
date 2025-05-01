import { useCreate_special_sectionsMutation, useGettripsQuery } from '@/store/api/trips';
import React, { useState } from 'react';


const CreateSpecialSection = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    trips: []
  });
  const [errors, setErrors] = useState<any>({});
  const [submitMessage, setSubmitMessage] = useState({ type: '', text: '' });

  // RTK Query hooks
  const { data: trips = [], isLoading: isLoadingTrips } = useGettripsQuery({});
  const [createSpecialSection, { isLoading: isSubmitting }] = useCreate_special_sectionsMutation();

  const handleChange = (e:any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTripSelection = (e:any) => {
    const tripId = e.target.value;
    const isChecked = e.target.checked;
    
    setFormData((prev:any) => {
      if (isChecked) {
        return { ...prev, trips: [...prev.trips, tripId] };
      } else {
        return { ...prev, trips: prev.trips.filter((id:any) => id !== tripId) };
      }
    });
  };

  const validateForm = () => {
    const newErrors:any = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'Title is required';
    }
    
    if (formData.trips.length === 0) {
      newErrors.trips = 'Please select at least one trip';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e:any) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setSubmitMessage({ type: '', text: '' });
    
    try {
      // Using RTK Query mutation hook
      await createSpecialSection(formData).unwrap();
      
      // Reset form after successful submission
      setFormData({
        title: '',
        description: '',
        trips: []
      });
      
      setSubmitMessage({
        type: 'success',
        text: 'Special section created successfully!'
      });
    } catch (error) {
      console.error('Error creating special section:', error);
      setSubmitMessage({
        type: 'error',
        text: 'Failed to create special section. Please try again.'
      });
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create Special Section</h1>
      
      {submitMessage.text && (
        <div className={`mb-4 p-3 rounded ${
          submitMessage.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {submitMessage.text}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.title ? 'border-red-500' : 'border-gray-300'
            }`}
          />
          {errors.title && <p className="mt-1 text-sm text-red-500">{errors.title}</p>}
        </div>
        
        <div className="mb-4">
          <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Select Trips <span className="text-red-500">*</span>
          </label>
          
          {isLoadingTrips ? (
            <p className="text-gray-600">Loading trips...</p>
          ) : trips.length === 0 ? (
            <p className="text-gray-600">No trips available</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-300 rounded-md p-3">
              {trips.map((trip:any) => (
                <div key={trip._id} className="flex items-start">
                  <input
                    type="checkbox"
                    id={`trip-${trip._id}`}
                    value={trip._id}
                    checked={formData.trips.includes(trip._id)}
                    onChange={handleTripSelection}
                    className="mt-1"
                  />
                  <label htmlFor={`trip-${trip._id}`} className="ml-2 block">
                    <span className="font-medium">{trip.title}</span>
                    <span className="text-sm text-gray-600 block">
                      {trip.location} - {trip.price}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          )}
          
          {errors.trips && <p className="mt-1 text-sm text-red-500">{errors.trips}</p>}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSubmitting ? 'Creating...' : 'Create Special Section'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateSpecialSection;