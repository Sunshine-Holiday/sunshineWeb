import React from 'react';
import { Link } from 'react-router-dom';

const links = {
  Company: [
    { name: 'About Us', path: '/about-us' },
    { name: 'Careers', path: '/careers' },
    { name: 'Press', path: '/press' },
  ],
  Support: [
    { name: 'Help Center', path: '/help-center' },
    { name: 'Safety', path: '/safety' },
    { name: 'Cancellation Options', path: '/cancellation-options' },
  ],
  Legal: [
    { name: 'Privacy Policy', path: '/privacy-policy' },
    { name: 'Terms and condition', path: '/terms-condition' },
    { name: 'Cookie Settings', path: '/cookie-settings' },
  ],
};

export const FooterLinks = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
      {Object.entries(links).map(([category, items]) => (
        <div key={category}>
          <h3 className="font-semibold mb-4">{category}</h3>
          <ul className="space-y-2">
            {items.map(({ name, path }) => (
              <li key={name}>
                <Link
                  to={path}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
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
