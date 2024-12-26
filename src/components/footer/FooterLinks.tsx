import React from 'react';
import { Link } from 'react-router-dom';

const links = {
  Company: ['About Us', 'Careers', 'Press'],
  Support: ['Help Center', 'Safety', 'Cancellation Options'],
  Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Settings'],
};

export const FooterLinks = () => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
      {Object.entries(links).map(([category, items]) => (
        <div key={category}>
          <h3 className="font-semibold mb-4">{category}</h3>
          <ul className="space-y-2">
            {items.map((item) => (
              <li key={item}>
                <Link
                  to="#"
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};