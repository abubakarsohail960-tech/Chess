import { Navbar } from "@/components/Navbar";
import { HomeHero } from "@/components/HomeHero";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-4 py-16">
        <HomeHero />
      </main>
    </>
  );
}
