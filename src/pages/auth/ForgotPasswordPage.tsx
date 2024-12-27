import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthCard } from './components/AuthCard';
import { FormInput } from './components/FormInput';
import { SubmitButton } from './components/SubmitButton';
import { useAuth } from '../../hooks/useAuth';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const { resetPassword, loading } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      setError('Email is required');
      return;
    }

    try {
      await resetPassword(email);
      setSuccessMessage('Password reset link has been sent to your email');
      setError(null);
      setTimeout(() => navigate('/signin'), 3000); // Redirect to sign-in after 3 seconds
    } catch (error) {
      setError('Failed to send password reset email');
      setSuccessMessage(null);
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1530789253388-582c481c54b0')" }}
    >
      <AuthCard title="Forgot Password" subtitle="Enter your email to reset your password">
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}
          {successMessage && (
            <div className="text-green-600 text-sm text-center">{successMessage}</div>
          )}

          <div className="space-y-4">
            <FormInput
              id="email"
              label="Email address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={error ? 'Invalid email address' : ''}
            />
          </div>

          <SubmitButton loading={loading}>Reset Password</SubmitButton>

          <div className="text-center text-sm">
            <span className="text-gray-600">Remembered your password?</span>{' '}
            <Link to="/signin" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </div>
        </form>
      </AuthCard>
    </div>
  );
};

export default ForgotPasswordPage;
