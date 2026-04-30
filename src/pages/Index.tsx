import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import AmbientEffects from "@/components/AmbientEffects";
import PixelCursor from "@/components/PixelCursor";
import GameIntro from "@/components/GameIntro";
import PlayerAvatar from "@/components/PlayerAvatar";
import ProgressSystem from "@/components/ProgressSystem";
import BehaviorSystem from "@/components/BehaviorSystem";

const Index = () => {
  return (
    <main className="relative min-h-screen bg-background text-foreground overflow-x-hidden">
      <GameIntro />
      <AmbientEffects />
      <ProgressSystem />
      <BehaviorSystem />
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <About />
        <Projects />
        <Experience />
        <Contact />
      </div>
      <PlayerAvatar />
      <PixelCursor />
    </main>
  );
};

export default Index;
