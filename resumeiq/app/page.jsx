import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import TrustedCompanies from "@/components/landing/TrustedCompanies";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import Statistics from "@/components/landing/Statistics";
import Testimonials from "@/components/landing/Testimonials";
import Pricing from "@/components/landing/Pricing";
import FAQ from "@/components/landing/FAQ";
import Footer from "@/components/landing/Footer";

export const metadata = {
  title: "ResumeIQ AI — AI-Powered Resume Analysis Platform",
  description:
    "Optimize your resume with AI. Get ATS scores, skill gap analysis, job match percentages, and expert suggestions to land more interviews faster.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <TrustedCompanies />
      <Features />
      <HowItWorks />
      <Statistics />
      <Testimonials />
      <Pricing />
      <FAQ />
      <Footer />
    </main>
  );
}
