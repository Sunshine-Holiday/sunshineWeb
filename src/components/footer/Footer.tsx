import React from 'react';
import { Plane } from 'lucide-react';
import { Link } from 'react-router-dom';
import { NewsletterForm } from './NewsletterForm';
import { SocialLinks } from './SocialLinks';
import { FooterLinks } from './FooterLinks';

export const Footer = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand and Newsletter */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-6">
              <Plane className="h-8 w-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900">
                Sunshine Holidays
              </span>
            </Link>
            <NewsletterForm />
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2">
            <FooterLinks />
          </div>

          {/* Social Links */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold mb-4">Follow Us</h3>
            <SocialLinks />
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-600">
            © {new Date().getFullYear()} Sunshine Holiday Packages. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};