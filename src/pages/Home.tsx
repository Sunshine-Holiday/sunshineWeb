import Hero from "../components/Hero";
import { FeaturedTrips } from "../components/FeaturedTrips";
import WhyChooseUs from "../components/WhyChooseUs";
import SpecialSections from "../components/SpecialSections";
import GlobalTraveler from "../components/InternationalPresence";
import HomeCTA from "../components/HomeCTA";

const Home = () => {
  return (
    <main className="overflow-x-hidden bg-white">
      <Hero />
      <FeaturedTrips />
      <SpecialSections />
      <WhyChooseUs />
      <GlobalTraveler />
      <HomeCTA />
    </main>
  );
};

export default Home;
