import { useSpecial_sectionsQuery, useDeleteSpecialSectionMutation } from '@/store/api/trips';
import { IMAGE_URL } from '@/store/store';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Plus } from 'lucide-react';
import { toast } from 'react-toastify';

interface StartDate {
  date: string;
  seats: number | 'block';
}

interface Trip {
  _id: string;
  title: string;
  banner: string;
  price: string;
  location: string;
  category: string;
  startDates: StartDate[];
  amenities: string[];
}

interface SpecialSection {
  _id: string;
  title: string;
  description?: string;
  trips: Trip[];
}

const PublicSpecialSections = () => {
  const { data: specialSections = [], isLoading, error } = useSpecial_sectionsQuery({});
  const [deleteSpecialSection, { isLoading: isDeleting }] = useDeleteSpecialSectionMutation();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [sectionToDelete, setSectionToDelete] = useState<SpecialSection | null>(null);
  const navigate = useNavigate();

  const handleEditClick = (sectionId: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigate(`/admin/special_sections/edit/${sectionId}`);
  };

  const handleDeleteClick = (section: SpecialSection, e: React.MouseEvent) => {
    e.preventDefault();
    setSectionToDelete(section);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!sectionToDelete) return;
    try {
      await deleteSpecialSection({ id: sectionToDelete._id }).unwrap();
      toast.success(`Special section "${sectionToDelete.title}" deleted successfully`);
    } catch (err) {
      console.error('Failed to delete the section:', err);
      toast.error(`Failed to delete "${sectionToDelete.title}". Please try again.`);
    } finally {
      setIsDeleteDialogOpen(false);
      setSectionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setIsDeleteDialogOpen(false);
    setSectionToDelete(null);
  };

  const handleCreateClick = () => {
    navigate('/admin/special_sections/create');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Something went wrong! </strong>
          <span className="block sm:inline">Please try again later.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 py-12 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Explore Our Special Trip Collections
          </h2>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Discover our carefully curated travel experiences designed for every type of adventurer
          </p>
        </div>

        {specialSections.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">Check back soon for our upcoming special travel collections!</p>
          </div>
        ) : (
          <div className="mt-12 space-y-16">
            {specialSections.map((section: SpecialSection) => (
              <div key={section._id} className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6 md:p-8">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold text-gray-800">{section.title}</h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={(e) => handleEditClick(section._id, e)}
                        className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-full transition-colors"
                        disabled={isDeleting}
                      >
                        <Pencil size={20} />
                      </button>
                      <button
                        onClick={(e) => handleDeleteClick(section, e)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-full transition-colors"
                        disabled={isDeleting}
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>

                  {section.description && (
                    <p className="text-gray-600 mb-8 max-w-3xl">{section.description}</p>
                  )}

                  {section.trips && section.trips.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {section.trips.map((trip: Trip) => (
                        <Link
                          key={trip._id}
                          to={`/trips/${trip._id}`}
                          className="group block"
                        >
                          <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition duration-300">
                            {trip.banner && (
                              <div className="relative h-48 overflow-hidden">
                                <img
                                  src={`${IMAGE_URL}${trip.banner}`}
                                  alt={trip.title}
                                  className="w-full h-full object-cover transform group-hover:scale-105 transition duration-500"
                                />
                                <div className="absolute bottom-0 right-0 bg-blue-600 text-white px-3 py-1 text-sm font-medium">
                                  {trip.price}
                                </div>
                              </div>
                            )}

                            <div className="p-4">
                              <h3 className="font-bold text-lg text-gray-800 mb-1 group-hover:text-blue-600 transition duration-300">
                                {trip.title}
                              </h3>

                              <div className="flex items-center text-gray-600 mb-2">
                                <svg
                                  className="h-4 w-4 mr-1"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                  />
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                </svg>
                                <span className="text-sm">{trip.location}</span>
                              </div>

                              {trip.category && (
                                <span className="inline-block bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded mb-3">
                                  {trip.category}
                                </span>
                              )}

                              {trip.startDates && trip.startDates.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-2">
                                  <span className="text-xs text-gray-500">Available dates:</span>
                                  {trip.startDates
                                    .filter((date): date is StartDate => !!date && typeof date.date === 'string')
                                    .slice(0, 2)
                                    .map((date, index) => (
                                      <span key={index} className="text-xs text-gray-600">
                                        {date.date}
                                        {index < Math.min(1, trip.startDates.length - 1) ? ',' : ''}
                                      </span>
                                    ))}
                                  {trip.startDates.length > 2 && (
                                    <span className="text-xs text-gray-600">
                                      +{trip.startDates.length - 2} more
                                    </span>
                                  )}
                                </div>
                              )}

                              {trip.amenities && trip.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {trip.amenities.slice(0, 3).map((amenity, index) => (
                                    <span
                                      key={index}
                                      className="inline-flex items-center text-xs text-gray-600"
                                    >
                                      <svg
                                        className="h-3 w-3 mr-1 text-green-500"
                                        fill="none"
                                        viewBox="0 0 24 24"
                                        stroke="currentColor"
                                      >
                                        <path
                                          strokeLinecap="round"
                                          strokeLinejoin="round"
                                          strokeWidth={2}
                                          d="M5 13l4 4L19 7"
                                        />
                                      </svg>
                                      {amenity}
                                    </span>
                                  ))}
                                  {trip.amenities.length > 3 && (
                                    <span className="text-xs text-gray-500">
                                      +{trip.amenities.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}

                              <div className="mt-3 flex items-center text-blue-600 font-medium text-sm">
                                View Details
                                <svg
                                  className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">Trips coming soon!</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Do you really want to delete "{sectionToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelDelete}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Floating Create Button */}
      <button
        onClick={handleCreateClick}
        className="fixed bottom-8 right-8 bg-blue-600 text-white rounded-full p-4 shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
        aria-label="Create new special section"
        disabled={isDeleting}
      >
        <Plus size={24} />
      </button>
    </div>
  );
};

export default PublicSpecialSections;