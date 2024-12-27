import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthCard } from './components/AuthCard';
import { FormInput } from './components/FormInput';
import { SubmitButton } from './components/SubmitButton';
import { useAuth } from '../../hooks/useAuth';

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signUp, loading } = useAuth();
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name) newErrors.name = 'Name is required';
    
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.phone) newErrors.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await signUp(formData.email, formData.password, formData.name);
      navigate('/');
    } catch (error) {
      setErrors({ form: 'Failed to create account' });
    }
  };

  return (
    <div
      className="min-h-screen bg-cover bg-center flex items-center justify-center"
      style={{ backgroundImage: "url('https://images.unsplash.com/photo-1530789253388-582c481c54b0')" }}
    >
      <AuthCard 
        title="Create Account"
        subtitle="Join us to start booking your bus tickets"
      >
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {errors.form && (
            <div className="text-red-600 text-sm text-center">{errors.form}</div>
          )}
          
          <div className="space-y-4">
            <FormInput
              id="name"
              label="Full name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
            />

            <FormInput
              id="email"
              label="Email address"
              type="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
            />

            <FormInput
              id="phone"
              label="Phone number"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              error={errors.phone}
            />

            <FormInput
              id="password"
              label="Password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
            />

            <FormInput
              id="confirmPassword"
              label="Confirm password"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
            />
          </div>

          <SubmitButton loading={loading}>Create Account</SubmitButton>

          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account?</span>{' '}
            <Link to="/signin" className="font-medium text-blue-600 hover:text-blue-500">
              Sign in
            </Link>
          </div>
        </form>
      </AuthCard>
    </div>
  );
};

export default SignUpPage;
