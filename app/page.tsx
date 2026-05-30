import HeroSection from "../components/Herosection";
import About from "../components/About";
import Services from "../components/Services";
import Therapists from "../components/Therapists";
import Testimonials from "../components/Testimonials";
import Pricing from "../components/Pricing";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <div className="bg-[#e8e4dc] min-h-screen">
      <div className="max-w-[1440px] mx-auto">
        <main>
          <HeroSection />
          <About />
          <Services />
          <Therapists />
          <Testimonials />
          <Pricing />
        </main>
        <Footer />
      </div>
    </div>
  );
}
