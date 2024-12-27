import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Clock, Calendar, Users, Bus, Wifi, Coffee, Snowflake, Power } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { fadeInUp, staggerChildren } from '../../utils/animations';

interface Amenity {
  icon: React.ElementType;
  name: string;
}

const amenities: Amenity[] = [
  { icon: Wifi, name: 'Free WiFi' },
  { icon: Coffee, name: 'Refreshments' },
  { icon: Snowflake, name: 'AC' },
  { icon: Power, name: 'Charging Points' },
];

 const TripDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const trip = location.state?.trip;

  if (!trip) {
    return <div>Trip not found</div>;
  }

  const handleBookNow = () => {
    navigate('/booking', { state: { tripId: trip.id } });
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerChildren}
          initial="initial"
          animate="animate"
          className="grid md:grid-cols-3 gap-8"
        >
          {/* Left Column - Main Info */}
          <motion.div variants={fadeInUp} className="md:col-span-2">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="h-64 relative">
                <img
                  src={trip.image}
                  alt={trip.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-full">
                  ₹{trip.price.toLocaleString('en-IN')||""}
                </div>
              </div>
              
              <div className="p-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">{trip.title}</h1>
                
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{trip.location}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-5 w-5 mr-2" />
                    <span>{trip.duration}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Calendar className="h-5 w-5 mr-2" />
                    <span>{trip.startDate}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Users className="h-5 w-5 mr-2" />
                    <span>{trip.groupSize}</span>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6">
                  <h2 className="text-xl font-semibold mb-4">Bus Information</h2>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center text-gray-600">
                      <Bus className="h-5 w-5 mr-2" />
                      <span>AC Sleeper</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <span>2x2 Configuration</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-xl font-semibold mb-4">Amenities</h2>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {amenities.map((amenity) => (
                      <div key={amenity.name} className="flex items-center text-gray-600">
                        <amenity.icon className="h-5 w-5 mr-2" />
                        <span>{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-6 mt-6">
                  <h2 className="text-xl font-semibold mb-4">Boarding Points</h2>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-2 rounded-lg mr-4">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Borivali West</h3>
                        <p className="text-sm text-gray-600">21:00 - Near Metro Station</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <div className="bg-blue-100 p-2 rounded-lg mr-4">
                        <MapPin className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">Andheri East</h3>
                        <p className="text-sm text-gray-600">21:45 - Western Express Highway</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right Column - Booking Card */}
          <motion.div variants={fadeInUp} className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-24">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Price Details</h2>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600">Base Fare</span>
                  <span>₹{trip.price.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">GST (5%)</span>
                  <span>₹{(trip.price * 0.05).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg pt-3 border-t">
                  <span>Total</span>
                  <span>₹{(trip.price * 1.05).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleBookNow}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700"
              >
                Book Now
              </motion.button>

              <div className="mt-6 text-sm text-gray-500">
                <p className="flex items-center mb-2">
                  <Calendar className="h-4 w-4 mr-2" />
                  Free cancellation up to 24 hours before departure
                </p>
                <p className="flex items-center">
                  <Users className="h-4 w-4 mr-2" />
                  Instant confirmation
                </p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};
export default TripDetails