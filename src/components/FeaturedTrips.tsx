import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { fadeInUp, staggerChildren, scaleOnHover } from '../utils/animations';

const trips = [
  {
    id: 1,
    title: 'Mumbai to Bangalore',
    image: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4',
    location: 'Express Bus',
    duration: '12 Hours',
    rating: 4.8,
    price: 1499,
  },
  {
    id: 2,
    title: 'Delhi to Jaipur',
    image: 'https://images.unsplash.com/photo-1531366936337-7c912a4589a7',
    location: 'AC Sleeper',
    duration: '5 Hours',
    rating: 4.9,
    price: 899,
  },
  {
    id: 3,
    title: 'Chennai to Bangalore',
    image: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff',
    location: 'Luxury Bus',
    duration: '6 Hours',
    rating: 4.7,
    price: 1299,
  },
];

export const FeaturedTrips = () => {
  const navigate = useNavigate();

  const handleBookNow = (tripId: number) => {
    navigate('/booking', { state: { tripId } });
  };

  return (
    <section className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          {...fadeInUp}
          className="text-center mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Featured Routes</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Book your journey with comfort and convenience
          </p>
        </motion.div>

        <motion.div 
          variants={staggerChildren}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: "-100px" }}
          className="grid md:grid-cols-3 gap-8"
        >
          {trips.map((trip) => (
            <motion.div
              key={trip.id}
              variants={fadeInUp}
              className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              <motion.div 
                className="relative h-48 overflow-hidden"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.3 }}
              >
                <img
                  src={trip.image}
                  alt={trip.title}
                  className="w-full h-full object-cover"
                />
              </motion.div>
              <div className="p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{trip.title}</h3>
                <div className="flex items-center space-x-2 text-gray-500 mb-2">
                  <MapPin className="h-4 w-4" />
                  <span>{trip.location}</span>
                </div>
                <div className="flex items-center space-x-2 text-gray-500 mb-4">
                  <Clock className="h-4 w-4" />
                  <span>{trip.duration}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                    <span className="text-gray-700">{trip.rating}</span>
                  </div>
                  <div className="text-blue-600 font-semibold">
                    ₹{trip.price}
                  </div>
                </div>
                <motion.button
                  {...scaleOnHover}
                  onClick={() => handleBookNow(trip.id)}
                  className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200"
                >
                  Book Now
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};