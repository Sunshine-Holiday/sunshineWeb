
import React from 'react';
import { Link } from 'react-router-dom';

const links = {
  Company: [
    { name: 'About Us', path: '/about-us' },
    { name: 'Contact', path: '/contact' },
  ],
  Support: [
    { name: 'Help Center', path: '/contact' },
    { name: 'Safety', path: '/terms-condition' },
    { name: 'Cancellation Options', path: '/privacy-policy' },
  ],
  Legal: [
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms and condition', path: '/terms-condition' },
  ],
};

export const FooterLinks = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-10">
      {Object.entries(links).map(([category, items]) => (
        <div key={category}>
          <h3 className="font-semibold text-lg text-gray-800 mb-4">{category}</h3>
          <ul className="space-y-3">
            {items.map(({ name, path }) => (
              <li key={name}>
                <Link
                  to={path}
                  className="footer-link text-gray-600 hover:text-orange-500 transition-colors duration-200"
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <style jsx>{`
        .footer-link {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 0.95rem;
          font-weight: 500;
          position: relative;
          display: inline-block;
        }
        .footer-link:hover::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 1px;
          background-color: #F97316;
          transform: scaleX(1);
          transform-origin: bottom right;
          transition: transform 0.2s ease-out;
        }
        .footer-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 100%;
          height: 1px;
          background-color: #F97316;
          transform: scaleX(0);
          transform-origin: bottom right;
          transition: transform 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default FooterLinks;
