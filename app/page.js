import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import InfoSection from "@/components/landing/InfoSection";
import Footer from "@/components/landing/Footer";
import ParticlesBackground from "@/components/landing/ParticlesBackground";
import CustomCursor from "@/components/ui/CustomCursor";
import AIAgentWidget from "@/components/landing/AIAgentWidget";

export default function Home() {
  return (
    <main className="min-h-screen relative selection:bg-sky-500/30 selection:text-white">
      <CustomCursor />
      <ParticlesBackground />
      
      <div className="relative z-10 flex flex-col">
        <Navbar />
        <Hero />
        <InfoSection />
        <Footer />
      </div>

      <AIAgentWidget />
    </main>
  );
}