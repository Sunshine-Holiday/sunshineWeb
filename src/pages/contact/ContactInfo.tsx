import React from "react";
import { MapPin, Phone, Mail, Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

export const ContactInfo = () => {
  const { t } = useTranslation();

  const contactInfo = [
    {
      icon: MapPin,
      title: t("contact.address"),
      content:
        "Sr No 53/1 Ashtavinayak Chowk, Sainath Nagar, Vadgaon Sheri, Pune - 411014",
      link: "https://maps.app.goo.gl/r7yCJp5CLY7voxLt9",
      type: "address" as const,
    },
    {
      icon: Phone,
      title: t("contact.phone"),
      content: "+91 9975375975 / +91 9175757178",
      link: "tel:+919975375975",
      type: "phone" as const,
    },
    {
      icon: Mail,
      title: t("contact.email"),
      content: "sunshineholidaypackages@gmail.com",
      link: "mailto:sunshineholidaypackages@gmail.com",
      type: "email" as const,
    },
    {
      icon: Clock,
      title: t("contact.hours"),
      content: t("contact.hoursValue"),
      type: "hours" as const,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2">
      {contactInfo.map(({ icon: Icon, title, content, link, type }) => (
        <div key={title} className="flex items-start space-x-4">
          <div className="rounded-lg bg-blue-100 p-3">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{title}</h3>
            <p className="text-gray-600">
              {link ? (
                type === "phone" ? (
                  <>
                    <a
                      href="tel:+919975375975"
                      className="text-blue-500 hover:underline"
                    >
                      +91 9975375975
                    </a>{" "}
                    /{" "}
                    <a
                      href="tel:+919175757178"
                      className="text-blue-500 hover:underline"
                    >
                      +91 9175757178
                    </a>
                  </>
                ) : (
                  <a href={link} className="text-blue-500 hover:underline">
                    {content}
                  </a>
                )
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
