import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthCard } from "./components/AuthCard";
import { FormInput } from "./components/FormInput";
import { SubmitButton } from "./components/SubmitButton";
import { useLoginMutation } from "@/store/api/auth";
import PasswordInput from "./components/PasswordIntput";
import { toast } from "react-toastify";
import { setCredentials } from "@/store/reducer/auth";
import { useDispatch } from "react-redux";

const SignInPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const [signIn] = useLoginMutation();
  const dispatch = useDispatch();

  const from = location.state?.from || "/";

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!email) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email))
      newErrors.email = "Invalid email format";

    if (!password) newErrors.password = "Password is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);

    try {
      const resp = await signIn({ email, password }).unwrap();
      if (resp.success) {
        toast.success("Logged in successfully");
        dispatch(setCredentials(resp));
        navigate(from || "/", { replace: true });
      }
    } catch (error) {
      console.error("Error logging in", error);
      setErrors({ form: "Invalid email or password" });
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
        subtitle="Sign in to your account to continue booking"
      >
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.form && (
            <div className="text-red-600 text-sm text-center">
              {errors.form}
            </div>
          )}

          <div className="space-y-4">
            <FormInput
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
            <PasswordInput
              id="password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-900"
              >
                Remember me
              </label>
            </div>
            <Link
              to="/forgot-password"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Forgot password?
            </Link>
          </div>

          <SubmitButton loading={loading}>Sign in</SubmitButton>

          <div className="text-center text-sm">
            <span className="text-gray-600">Don't have an account?</span>{" "}
            <Link
              to="/signup"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              Sign up
            </Link>
          </div>
        </form>
      </AuthCard>
    </div>
  );
};

export default SignInPage;
