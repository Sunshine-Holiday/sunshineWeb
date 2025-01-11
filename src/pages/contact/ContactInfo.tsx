import React from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";

const contactInfo = [
  {
    icon: MapPin,
    title: "Address",
    content: "Pune, India, Maharashtra",
    link: "https://www.google.com/maps/search/Pune,+India,+Maharashtra",
  },
  {
    icon: Phone,
    title: "Phone",
    content: "+91 9975375975",
    link: "tel:+919975375975",
  },
  {
    icon: Mail,
    title: "Email",
    content: "sunshineholidaypackages@gmail.com",
    link: "mailto:sunshineholidaypackages@gmail.com",
  },
  {
    icon: Clock,
    title: "Hours",
    content: "Mon-Fri: 9AM-6PM",
  },
];

export const ContactInfo = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 gap-8">
      {contactInfo.map(({ icon: Icon, title, content, link }) => (
        <div key={title} className="flex items-start space-x-4">
          <div className="bg-blue-100 p-3 rounded-lg">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-gray-600">
              {link ? (
                <a href={link} className="text-blue-500 hover:underline">
                  {content}
                </a>
              ) : (
                content
              )}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
