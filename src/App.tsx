import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/footer/Footer";
import { useSmooth } from "./utils/scrollUtils";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import BlogDetailPage from "./pages/blog/BlogDetailPage";
import { Provider, useDispatch, useSelector } from "react-redux";
import { store } from "./store/store";
import imagelogo from "./asserts/Sunshine.png";
import { ToastContainer } from "react-toastify";
import { LoadingSkeleton } from "./loader/loader";
import { useGetMyProfileQuery } from "./store/api/auth";
import {
  authError,
  selectCurrentLoading,
  setCredentials,
} from "./store/reducer/auth";
const Profile = React.lazy(() => import("./pages/Profile"));
const TripsPage = React.lazy(() => import("./pages/trips/TripsPage"));
const OTPPage = React.lazy(() => import("./pages/auth/OTPPage"));
const TripDetails = React.lazy(() => import("./pages/trips/TripDetails"));
const BlogPage = React.lazy(() => import("./pages/blog/BlogPage"));
const GalleryPage = React.lazy(() => import("./pages/gallery/GalleryPage"));
const ContactPage = React.lazy(() => import("./pages/contact/ContactPage"));
const SignInPage = React.lazy(() => import("./pages/auth/SignInPage"));
const SignUpPage = React.lazy(() => import("./pages/auth/SignUpPage"));

const ResetPasword = React.lazy(() => import("./pages/auth/resetPassword"));
const ForgotPasswordPage = React.lazy(
  () => import("./pages/auth/ForgotPasswordPage")
);
const BookingPage = React.lazy(() => import("./pages/booking/BookingPage"));
const HomePage = React.lazy(() => import("./pages/Home"));

// Skeleton Loader using Tailwind CSS

export const AppContent = () => {
  useSmooth();
  const { data, error, isLoading } = useGetMyProfileQuery();
  const reduxDispatch = useDispatch();
  const isAuthLoading = useSelector(selectCurrentLoading);
  useEffect(() => {
    if (data) {
      console.log("Data", data);
      reduxDispatch(
        setCredentials({
          user: data.user,
        })
      );
    } else if (error) {
      console.log("Error", error);
      reduxDispatch(authError());
    }
  }, [data, error]);
  if (isAuthLoading) {
    return <LoadingSkeleton imagelogo={imagelogo} />;
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <React.Suspense fallback={<LoadingSkeleton imagelogo={imagelogo} />}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/trips/:id" element={<TripDetails />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetailPage />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/otp-verify" element={<OTPPage />} />
          <Route path="/reset-password" element={<ResetPasword />} />
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
        <ToastContainer />
      </Router>
    </Provider>
  );
}

export default App;
