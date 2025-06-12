
import { Link } from "react-router-dom";
import { SocialLinks } from "./SocialLinks";
import { FooterLinks } from "./FooterLinks";
import logo1 from "../../asserts/logo_sunshine.gif";

export const Footer = () => {
  return (
    <footer className="bg-white text-gray-800 border-t border-gray-200 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand and Newsletter */}
          <div className="lg:col-span-1">
            <Link to="/" className="flex flex-col items-center space-y-4 mb-6">
              <div className="relative h-16 w-16 flex items-center justify-center">
                <img
                  src={logo1}
                  alt="Sunshine Holiday Packages Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <span className="text-xl font-bold text-gray-800 text-center">
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
            <h3 className="font-semibold text-lg text-gray-800 mb-4">Follow Us</h3>
            <SocialLinks />
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <p className="text-center text-gray-500 text-sm">
            © {new Date().getFullYear()} Sunshine Holiday Packages. All rights reserved.
          </p>
        </div>
      </div>

      <style jsx>{`
        footer {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }
        .footer-link {
          color: #4B5563;
          font-size: 0.95rem;
          font-weight: 500;
          transition: color 0.2s ease;
        }
        .footer-link:hover {
          color: #F97316;
        }
        .social-link {
          color: #4B5563;
          transition: color 0.2s ease, transform 0.2s ease;
        }
        .social-link:hover {
          color: #F97316;
          transform: scale(1.1);
        }
      `}</style>
    </footer>
  );
};

export default Footer;
