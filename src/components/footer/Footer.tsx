import { Link } from "react-router-dom";
import { SocialLinks } from "./SocialLinks";
import { FooterLinks } from "./FooterLinks";
import logo1 from "../../asserts/logo_sunshine.gif";
import { useTranslation } from "react-i18next";

export const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-slate-800 bg-slate-950 pt-16 pb-8 text-slate-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <Link to="/" className="mb-6 flex flex-col items-start space-y-4">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 p-2">
                <img
                  src={logo1}
                  alt="Sunshine Holiday Packages Logo"
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <span className="block text-lg font-bold text-white">
                  Sunshine Holiday Packages
                </span>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">
                  {t("footer.tagline")}
                </p>
              </div>
            </Link>
          </div>

          <div className="lg:col-span-2">
            <FooterLinks />
          </div>

          <div className="lg:col-span-1">
            <h3 className="mb-4 text-base font-semibold text-white">
              {t("footer.followUs")}
            </h3>
            <SocialLinks />
          </div>
        </div>

        <div className="mt-12 border-t border-slate-800 pt-8">
          <p className="text-center text-sm text-slate-500">
            © {new Date().getFullYear()} Sunshine Holiday Packages.{" "}
            {t("footer.rights")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
