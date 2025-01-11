import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/footer/Footer";
import { useSmooth } from "./utils/scrollUtils";
import React, { useEffect } from "react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import BlogDetailPage from "./pages/blog/BlogDetailPage";
import { Provider } from "react-redux";
import { store } from "./store/store";
import { useUserDetailQuery } from "./store/initalState";
// Lazy load components
const TripsPage = React.lazy(() => import("./pages/trips/TripsPage"));
const OTPPage = React.lazy(() => import("./pages/auth/OTPPage"));
const TripDetails = React.lazy(() => import("./pages/trips/TripDetails"));
const BlogPage = React.lazy(() => import("./pages/blog/BlogPage"));
const GalleryPage = React.lazy(() => import("./pages/gallery/GalleryPage"));
const ContactPage = React.lazy(() => import("./pages/contact/ContactPage"));
const SignInPage = React.lazy(() => import("./pages/auth/SignInPage"));
const SignUpPage = React.lazy(() => import("./pages/auth/SignUpPage"));
const ForgotPasswordPage = React.lazy(
  () => import("./pages/auth/ForgotPasswordPage")
);
const BookingPage = React.lazy(() => import("./pages/booking/BookingPage"));
const HomePage = React.lazy(() => import("./pages/Home"));

// Skeleton Loader using Tailwind CSS
const LoadingSkeleton = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="h-44 w-44 bg-gray-300 animate-pulse rounded-full"></div>
  </div>
);

export const AppContent = () => {
  useSmooth();
  

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <React.Suspense fallback={<LoadingSkeleton />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/trips/:id" element={<TripDetails />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetailPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/otp-verify" element={<OTPPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/booking" element={<BookingPage />} />
        </Routes>
      </React.Suspense>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AppContent />
      </Router>
    </Provider>
  );
}

export default App;
