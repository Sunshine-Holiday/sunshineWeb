import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/footer/Footer";
import { useSmooth } from "./utils/scrollUtils";
import { Hero } from "./components/Hero";
import { FeaturedTrips } from "./components/FeaturedTrips";
import GlobalTraveler from "./components/InternationalPresence";
import React from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
// Lazy load components
const TripsPage = React.lazy(() => import("./pages/trips/TripsPage"));
const TripDetails = React.lazy(() => import("./pages/trips/TripDetails"));
const BlogPage = React.lazy(() => import("./pages/blog/BlogPage"));
const GalleryPage = React.lazy(() => import("./pages/gallery/GalleryPage"));
const ContactPage = React.lazy(() => import("./pages/contact/ContactPage"));
const SignInPage = React.lazy(() => import("./pages/auth/SignInPage"));
const SignUpPage = React.lazy(() => import("./pages/auth/SignUpPage"));
const BookingPage = React.lazy(() => import("./pages/booking/BookingPage"));

// Define HomePage component
const HomePage = () => (
  <main>
    <Hero />
    <FeaturedTrips />
    <GlobalTraveler />
  </main>
);

// Skeleton Loader using Tailwind CSS
const LoadingSkeleton = () => (
  <div className="space-y-4 p-6">
    <div className="h-48 bg-gray-300 animate-pulse rounded-lg"></div> {/* Skeleton for images */}
    <div className="h-8 bg-gray-300 animate-pulse rounded-md"></div> {/* Skeleton for title */}
    <div className="h-6 bg-gray-300 animate-pulse rounded-md"></div> {/* Skeleton for subtitle */}
    <div className="space-y-2">
      <div className="h-4 bg-gray-300 animate-pulse rounded-md"></div>
      <div className="h-4 bg-gray-300 animate-pulse rounded-md"></div>
      <div className="h-4 bg-gray-300 animate-pulse rounded-md"></div>
    </div>
  </div>
);

export const App = () => {
  useSmooth();

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <React.Suspense fallback={<LoadingSkeleton />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/trips" element={<TripsPage />} />
            <Route path="/trips/:id" element={<TripDetails />} />
            <Route path="/blog" element={<BlogPage />} />
            <Route path="/gallery" element={<GalleryPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/booking" element={<BookingPage />} />
          </Routes>
        </React.Suspense>
        <Footer />
      </div>
    </Router>
  );
};
