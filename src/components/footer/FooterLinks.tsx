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
    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
      {Object.entries(links).map(([category, items]) => (
        <div key={category}>
          <h3 className="font-semibold text-gray-100 mb-4">{category}</h3>
          <ul className="space-y-2">
            {items.map(({ name, path }) => (
              <li key={name}>
                <Link
                  to={path}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  {name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
