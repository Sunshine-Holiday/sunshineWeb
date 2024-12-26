import React from 'react';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';

const contactInfo = [
  {
    icon: MapPin,
    title: 'Address',
    content: '123 Travel Street, Adventure City, AC 12345',
  },
  {
    icon: Phone,
    title: 'Phone',
    content: '+1 (555) 123-4567',
  },
  {
    icon: Mail,
    title: 'Email',
    content: 'info@sunshineholidays.com',
  },
  {
    icon: Clock,
    title: 'Hours',
    content: 'Mon-Fri: 9AM-6PM',
  },
];

export const ContactInfo = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {contactInfo.map(({ icon: Icon, title, content }) => (
        <div key={title} className="flex items-start space-x-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-gray-600">{content}</p>
          </div>
        </div>
      ))}
    </div>
  );
};