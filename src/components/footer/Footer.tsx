import { Link } from "react-router-dom";

import { SocialLinks } from "./SocialLinks";
import { FooterLinks } from "./FooterLinks";

import logo1 from "../../asserts/logo_sunshine.gif";

export const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white border-t border-gray-700 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand and Newsletter */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex flex-col items-center space-y-4 mb-6">
              {/* Video logo */}
              <div className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-28 md:w-28 bg-gray-300 rounded-full overflow-hidden flex items-center justify-center">
                <img
                  src={logo1}
                  alt="Sunshine Holiday Packages Logo"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-xl font-bold text-white text-center">
                Sunshine Holiday Packages
              </span>
            </Link>
            {/* Optionally re-enable NewsletterForm */}
            {/* <NewsletterForm /> */}
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2">
            <FooterLinks />
          </div>

          {/* Social Links */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold mb-4 text-white">Follow Us</h3>
            <SocialLinks />
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-700">
          <p className="text-center text-gray-400">
            © {new Date().getFullYear()} Sunshine Holiday Packages. All rights
            reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
