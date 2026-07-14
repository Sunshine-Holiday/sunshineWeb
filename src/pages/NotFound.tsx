import { Link } from "react-router-dom";
import logo from "../asserts/Sunshine.png";
import { useTranslation } from "react-i18next";

const NotFound = () => {
  const { t } = useTranslation();
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="text-center">
        <img
          src={logo}
          alt="404"
          className="mx-auto mb-6 w-64 rounded-lg shadow-lg"
        />
        <h1 className="mb-4 text-5xl font-bold text-gray-800">
          {t("notFound.title")}
        </h1>
        <p className="mb-6 text-lg text-gray-600">{t("notFound.subtitle")}</p>
        <Link
          to="/"
          className="rounded-lg bg-orange-500 px-6 py-3 text-xl text-white transition duration-300 hover:bg-orange-600"
        >
          {t("notFound.home")}
        </Link>
      </div>
    </div>
  );
};
export default NotFound;
