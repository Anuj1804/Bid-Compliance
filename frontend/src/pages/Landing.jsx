import Navbar from "../Components/landing/Navbar";
import Hero from "../Components/landing/Hero";
import ProblemSection from "../Components/landing/ProblemSection";
// import Features from "../Components/landing/Features";
import DashboardPreview from "../Components/landing/DashboardPreview";
import Impact from "../Components/landing/Impact";
import TrustBar from "../Components/landing/TrustBar";
import Footer from "../Components/landing/Footer";

export default function Landing() {
  return (
    <>
      <Navbar />
      <Hero />
      <ProblemSection />
      {/* <Features /> */}
      <DashboardPreview />
      <Impact />
      <TrustBar />
      <Footer />
    </>
  );
}