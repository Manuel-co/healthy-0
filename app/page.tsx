import HeroSection from "../components/Herosection";
import Mission from "../components/Mission";
import About from "../components/About";
import Services from "../components/Services";
import Therapists from "../components/Therapists";
import Testimonials from "../components/Testimonials";
import Pricing from "../components/Pricing";
import Footer from "../components/Footer";

export default function HomePage() {
  return (
    <div className="bg-[#fffef8] min-h-screen">
      <div className="max-w-[1440px] mx-auto">
        <main>
          <HeroSection />
          <Services />
          <Mission />
          <About />
          <Therapists />
          <Testimonials />
          <Pricing />
        </main>
        <Footer />
      </div>
    </div>
  );
}
