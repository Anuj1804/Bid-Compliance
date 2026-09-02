import Navbar from "./Components/landing/Navbar";
import Hero from "./Components/landing/Hero";
import ProblemSection from "./Components/landing/ProblemSection";
import DashboardPreview from "./Components/landing/DashboardPreview";
import Impact from "./Components/landing/Impact";
import TrustBar from "./Components/landing/TrustBar";
import Footer from "./Components/landing/Footer";

function App() {
  return (
    <div>
      <Navbar />
      <Hero />
      <ProblemSection />
      <DashboardPreview />
      <Impact />
      <TrustBar />
      <Footer />
    </div>
  );
}

export default App;