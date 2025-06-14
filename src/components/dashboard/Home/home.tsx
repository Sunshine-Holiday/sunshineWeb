
import React, { useState, useCallback } from "react";
import { DndContext, closestCenter, useSensor, useSensors, MouseSensor, TouchSensor, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Trash2, Upload, Camera, Move, Plus, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { IMAGE_URL } from "@/store/store";
import {
  useGetHomeImagesQuery,
  useUploadHomeImageMutation,
  useDeleteHomeImageMutation,
  useUpdateImageSequenceMutation,
} from "@/store/api/gallery";
import { toast } from "react-toastify";

interface Image {
  _id: string;
  path: string;
  originalName: string;
  mimeType: string;
  sequence: number;
  createdAt: string;
}

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

// Sortable Image Item Component
interface SortableImageProps {
  image: Image;
  isDragging: boolean;
  handleDelete: (id: string) => void;
}

const SortableImage: React.FC<SortableImageProps> = ({ image, isDragging, handleDelete }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: isItemDragging } = useSortable({ id: image._id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      variants={fadeInUp}
      className={`relative group cursor-move bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-2 ${
        isItemDragging ? "border-orange-400 scale-105 rotate-1" : "border-gray-100 hover:border-orange-200"
      }`}
    >
      <div className="aspect-video relative overflow-hidden">
        <img
          src={`${IMAGE_URL}${image.path}`}
          alt={image.originalName}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {/* Drag Indicator */}
        <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <Move className="w-4 h-4 text-orange-600" />
        </div>
        {/* Delete Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(image._id);
          }}
          disabled={isDragging}
          className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform hover:scale-110"
          aria-label={`Delete ${image.originalName}`}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600 truncate">Image {image.sequence + 1}</span>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
            <div className="w-2 h-2 bg-orange-300 rounded-full"></div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const AdminHomeControl: React.FC = () => {
  const [images, setImages] = useState<Image[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const { data: fetchedImages, isLoading, error } = useGetHomeImagesQuery();
  const [uploadHomeImage, { isLoading: isUploading }] = useUploadHomeImageMutation();
  const [deleteHomeImage, { isLoading: isDeleting }] = useDeleteHomeImageMutation();
  const [updateImageSequence] = useUpdateImageSequenceMutation();

  // Sync fetched images with local state
  React.useEffect(() => {
    if (fetchedImages) {
      setImages(fetchedImages);
    }
  }, [fetchedImages]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } })
  );

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  }, []);

  const handleUpload = useCallback(async () => {
    if (!selectedFile || isDragging) return;

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await uploadHomeImage(formData).unwrap();
 toast.success("Image uploaded successfully!", { position: "top-right" });
    } catch (error) {
      console.error("Upload failed:", error);
toast.error("Failed to upload image. Please try again.", { position: "top-right" });
    }
  }, [selectedFile, isDragging, uploadHomeImage]);

  const handleDelete = useCallback((id: string) => {
    if (isDragging) return;
    setDeleteImageId(id);
  }, [isDragging]);

  const confirmDelete = useCallback(async () => {
    if (!deleteImageId || isDragging) return;

    try {
      await deleteHomeImage(deleteImageId).unwrap();
 toast.success("Image deleted successfully!", { position: "top-right" });
 setDeleteImageId(null)
    } catch (error) {
      console.error("Deletion failed:", error);
      toast.error("Failed to delete image. Please try again.", { position: "top-right" });
    }
  }, [deleteImageId, isDragging, deleteHomeImage]);

  const handleDragStart = useCallback(() => {
    setIsDragging(true);
  }, []);

  const handleDragEnd = useCallback(
    async (event: DragEndEvent) => {
      setIsDragging(false);
      const { active, over } = event;

      if (active.id !== over?.id) {
setImages((prev) => {
  const oldIndex = prev.findIndex((image) => image._id === active.id);
  const newIndex = prev.findIndex((image) => image._id === over?.id);
  const reorderedImages = arrayMove(prev, oldIndex, newIndex);
  return reorderedImages.map((image, index) => ({ ...image, sequence: index }));
});

        // Update sequence on backend
try {
  const sequenceData = images.map((image, index) => ({
    id: image._id,
    sequence: index,
  }));
  await updateImageSequence({ images: sequenceData }).unwrap();
    toast.success("Image sequence updated successfully!", { position: "top-right" });
        } catch (error) {
          console.error("Sequence update failed:", error);
          toast.error("Failed to update image sequence. Please try again.", { position: "top-right" });
        }
      }
    },
    [images, updateImageSequence]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-orange-50 py-12 relative overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-200 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-200 rounded-full opacity-20 blur-3xl animate-pulse" style={{ animationDelay: "2s" }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div variants={fadeInUp} initial="initial" animate="animate" className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl mb-6 shadow-lg">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold bg-gradient-to-r from-gray-900 via-orange-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Home Image Layout Manager
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Organize your hero images with our intuitive drag-and-drop interface.
          </p>
        </motion.div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12 bg-red-50 rounded-lg shadow-sm mb-8">
            <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <p className="text-red-600">Failed to load images. Please try again later.</p>
          </div>
        )}

        {/* Upload Section */}
        <motion.div variants={fadeInUp} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 mb-10 border border-white/20">
          <div className="flex items-center mb-6">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mr-4">
              <Plus className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Add New Image</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6 items-end">
            <div>
              <label htmlFor="file-upload" className="block text-sm font-semibold text-gray-700 mb-3">
                Choose Image File
              </label>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading || isDragging}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
              />
              {selectedFile && (
                <p className="mt-2 text-sm text-gray-500 truncate">Selected: {selectedFile.name}</p>
              )}
            </div>
            <div>
              <button
                onClick={handleUpload}
                disabled={!selectedFile || isUploading || isDragging}
                className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-3"
              >
                <Upload className="w-5 h-5" />
                {isUploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Uploading...
                  </>
                ) : (
                  "Upload Image"
                )}
              </button>
            </div>
          </div>
        </motion.div>

        {/* Images Grid */}
        <motion.div variants={fadeInUp} className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl p-8 border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center mr-4">
                <Move className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Your Images</h2>
                <p className="text-gray-600">Drag and drop to reorder</p>
              </div>
            </div>
            <div className="bg-orange-100 text-orange-800 px-4 py-2 rounded-full font-semibold">
              {images.length} {images.length === 1 ? "Image" : "Images"}
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-orange-200 rounded-full animate-spin"></div>
                <div className="absolute inset-0 w-16 h-16 border-4 border-orange-500 rounded-full animate-spin border-t-transparent"></div>
              </div>
            </div>
          ) : images.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Camera className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No Images Yet</h3>
              <p className="text-gray-600">Upload your first image to get started</p>
            </div>
          ) : (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
              <SortableContext items={images.map((image) => image._id)} strategy={verticalListSortingStrategy}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {images.map((image, index) => (
                    <SortableImage
                      key={image._id}
                      image={image}
                      isDragging={isDragging}
                      handleDelete={handleDelete}
                    />
                  ))}
                </div>
              </SortableContext>
            </DndContext>
          )}
        </motion.div>

        {/* Delete Confirmation Modal */}
        {deleteImageId && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="bg-white/95 rounded-2xl shadow-lg p-8 max-w-md w-full border border-white/20"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Trash2 className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Delete Image?</h3>
                <p className="text-gray-600 mb-8">Are you sure you want to delete this image? This action cannot be undone.</p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => setDeleteImageId(null)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-6 rounded-xl transition-colors"
                    aria-label="Cancel deletion"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                    aria-label="Confirm deletion"
                  >
                    {isDeleting && <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>}
                    Delete
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        <style jsx>{`
          .grid {
            background-clip: padding-box;
          }
          @keyframes pulse {
            0% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.05);
            }
            100% {
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default AdminHomeControl;