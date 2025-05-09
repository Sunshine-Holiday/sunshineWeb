import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  Navigate,
} from "react-router-dom";
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
  selectCurrentUser,
  setCredentials,
} from "./store/reducer/auth";
import ProtectedRoute from "./protectedRoute/protectedRouter";
import RedirectRoute from "./protectedRoute/RedirectRoute";
import Layout from "./layout/Layout";
import BookingDetail from "./pages/admin/BookingDetail";
import ReviewCreatePage from "./pages/review/CreateReview";
const About = React.lazy(() => import("./pages/about/About"));

const PrivacyPolicy = React.lazy(
  () => import("./pages/privacy/privacy-policy")
);
const Booked = React.lazy(() => import("./pages/booked/Booked"));
const VerifyEmailOTP = React.lazy(() => import("./pages/auth/VerifyEmailOTP"));
const TermsAndCondition = React.lazy(
  () => import("./pages/terms/TermsAndCondition")
);
const Profile = React.lazy(() => import("./pages/Profile"));
const TripsPage = React.lazy(() => import("./pages/trips/TripsPage"));
const OTPPage = React.lazy(() => import("./pages/auth/OTPPage"));
const TripDetails = React.lazy(() => import("./pages/trips/TripDetails"));
const BlogPage = React.lazy(() => import("./pages/blog/BlogPage"));
const GalleryPage = React.lazy(() => import("./pages/gallery/GalleryPage"));
const ContactPage = React.lazy(() => import("./pages/contact/ContactPage"));
const SignInPage = React.lazy(() => import("./pages/auth/SignInPage"));
const SignUpPage = React.lazy(() => import("./pages/auth/SignUpPage"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const ResetPasword = React.lazy(() => import("./pages/auth/resetPassword"));
const ForgotPasswordPage = React.lazy(
  () => import("./pages/auth/ForgotPasswordPage")
);
const BookingPage = React.lazy(() => import("./pages/booking/BookingPage"));
const HomePage = React.lazy(() => import("./pages/Home"));

// Skeleton Loader using Tailwind CSS
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
export const AppContent = () => {
  useSmooth();
  const { data, error, isLoading } = useGetMyProfileQuery();
  const reduxDispatch = useDispatch();
  const location = useLocation();
  const from = location.state?.from || "/";
  const user = useSelector(selectCurrentUser);
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
  if (isAuthLoading || isLoading) {
    return <LoadingSkeleton  />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <React.Suspense fallback={<LoadingSkeleton  />}>
        <Routes>
          <Route element={<RedirectRoute redirectPath={from} />}>
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/otp-verify" element={<OTPPage />} />
            <Route path="/reset-password" element={<ResetPasword />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/email-verify" element={<VerifyEmailOTP />} />
          </Route>

          <Route path="/" element={<HomePage />} />

          <Route
            path="/profile"
            element={
              <ProtectedRoute role={user?.role}>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route path="/trips" element={<TripsPage />} />
          <Route path="/trips/:id" element={<TripDetails />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route
            path="/blog/:id"
            element={
              <ProtectedRoute role={user?.role}>
                <BlogDetailPage />
              </ProtectedRoute>
            }
          />
          <Route path="/about-us" element={<About />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-condition" element={<TermsAndCondition />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/admin" element={<Navigate to="/admin/dashboard" />} />
          <Route
            path="/admin/*"
            element={
              <ProtectedRoute role={"admin"}>
                <Layout />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booking"
            element={
              <ProtectedRoute role={user?.role}>
                <BookingPage />
              </ProtectedRoute>
            }
          />
             <Route
            path="/review/:id"
            element={
              <ProtectedRoute role={user?.role}>
                <ReviewCreatePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booked"
            element={
              <ProtectedRoute role={user?.role}>
                <Booked />
              </ProtectedRoute>
            }
          />
          <Route
            path="/booked/:id"
            element={
              <ProtectedRoute role={user?.role}>
                <BookingDetail />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
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
