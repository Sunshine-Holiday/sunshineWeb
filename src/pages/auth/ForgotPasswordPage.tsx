import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthCard } from "./components/AuthCard";
import { FormInput } from "./components/FormInput";
import { SubmitButton } from "./components/SubmitButton";

import { useForgetPasswordMutation } from "@/store/api/auth";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  // const { resetPassword, loading } = useAuth();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [forgetPassword] = useForgetPasswordMutation();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError("Email is required");
      return;
    }
    setLoading(true)
    try {
      const resp = await forgetPassword({ email }).unwrap();
      if (resp.success) {
        setSuccessMessage("Password reset otp has been sent to your email");
        setError(null);
        navigate("/otp-verify", { state: { email: email } });
      }
      // setTimeout(() => navigate("/otp-verify"), 3000); // Redirect to sign-in after 3 seconds
    } catch (error: any) {
      console.log(error.data.message);
      setError(error?.data?.message || "Failed to send password reset email");
      setSuccessMessage(null);
      setLoading(false)
    }finally{
      setLoading(false)
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1530789253388-582c481c54b0')",
      }}
    >
      <AuthCard
        title="Forgot Password"
        subtitle="Enter your email to reset your password"
      >
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          {successMessage && (
            <div className="text-green-600 text-sm text-center">
              {successMessage}
            </div>
          )}

          <div className="space-y-4">
            <FormInput
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // error={error ?? ""}
            />
          </div>

          <SubmitButton loading={loading}>Reset Password</SubmitButton>

          <div className="text-center text-sm">
            <span className="text-gray-600">Remembered your password?</span>{" "}
            <Link
              to="/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign in
            </Link>
          </div>
        </form>
      </AuthCard>
    </div>
  );
};

export default ForgotPasswordPage;
