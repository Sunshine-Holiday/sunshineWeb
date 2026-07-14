import React from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const FooterLinks = () => {
  const { t } = useTranslation();

  const links = {
    [t("footer.company")]: [
      { name: t("footer.aboutUs"), path: "/about-us" },
      { name: t("footer.contact"), path: "/contact" },
    ],
    [t("footer.support")]: [
      { name: t("footer.helpCenter"), path: "/contact" },
      { name: t("footer.safety"), path: "/terms-condition" },
      { name: t("footer.cancellation"), path: "/privacy-policy" },
    ],
    [t("footer.legal")]: [
      { name: t("footer.privacy"), path: "/privacy-policy" },
      { name: t("footer.terms"), path: "/terms-condition" },
    ],
  };

  return (
    <div className="grid grid-cols-2 gap-10 md:grid-cols-3">
      {Object.entries(links).map(([category, items]) => (
        <div key={category}>
          <h3 className="mb-4 text-base font-semibold text-white">
            {category}
          </h3>
          <ul className="space-y-3">
            {items.map(({ name, path }) => (
              <li key={`${category}-${name}`}>
                <Link
                  to={path}
                  className="text-sm font-medium text-slate-400 transition-colors duration-200 hover:text-orange-400"
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

export default FooterLinks;
