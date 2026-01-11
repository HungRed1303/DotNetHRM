// src/pages/landing/LandingPage.tsx
import Header from "../../components/LandingPage/Header";
import Hero from "../../components/LandingPage/Hero";
import Stats from "../../components/LandingPage/Stats";
import Activities from "../../components/LandingPage/Activities";
import Gallery from "../../components/LandingPage/Gallery";
import Footer from "../../components/LandingPage/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen w-full bg-white text-gray-900">
      <Header />
      <main>
        <Hero />
        <Stats />
        <Activities />
        <Gallery />
      </main>
      <Footer />
    </div>
  );
}
