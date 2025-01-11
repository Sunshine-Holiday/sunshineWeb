import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthCard } from "./components/AuthCard";
import { FormInput } from "./components/FormInput";
import { SubmitButton } from "./components/SubmitButton";
import { useResetPasswordMutation } from "@/store/api/auth";
import PasswordInput from "./components/PasswordIntput";

const ResetPasword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { email, otp } = location.state || {};
  const [resetPassword] = useResetPasswordMutation();

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email || !otp) {
      navigate("/"); // Redirect to home if required data is missing
    }
  }, [email, otp, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
    setErrors((prev) => ({ ...prev, [id]: "" })); // Clear specific error
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      await resetPassword({ email, otp, password: formData.password }).unwrap();
      navigate("/signin");
    } catch (error) {
      setErrors({ form: "Failed to reset password. Please try again." });
    } finally {
      setLoading(false);
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
        title="Welcome Back"
        subtitle="Reset your password to continue"
      >
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.form && (
            <div className="text-red-600 text-sm text-center">{errors.form}</div>
          )}

          <div className="space-y-4">
            <PasswordInput
              id="password"
              label="New Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />
            <PasswordInput
              id="confirmPassword"
              label="Confirm Password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />
          </div>

          <SubmitButton loading={loading}>Reset Password</SubmitButton>

          <div className="text-center text-sm">
            <span className="text-gray-600">Changed your mind? </span>
            <Link
              to="/signin"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Go Back
            </Link>
          </div>
        </form>
      </AuthCard>
    </div>
  );
};

export default ResetPasword;
