import { Poppins, Inter } from "next/font/google";
import "./globals.css";
import { UserProvider } from "@/lib/context/UserContext";
import { ToastProvider } from "@/lib/context/ToastContext";
import { ThemeProvider } from "@/components/ThemeProvider";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata = {
  title: "ResumeIQ AI — AI-Powered Resume Analysis Platform",
  description:
    "Optimize your resume with AI. Get ATS scores, skill gap analysis, job match percentages, and expert suggestions to land more interviews faster.",
  keywords:
    "resume analyzer, ATS score, resume optimization, job match, skill gap analysis, AI resume, career tool",
  openGraph: {
    title: "ResumeIQ AI — AI-Powered Resume Analysis",
    description:
      "Land more interviews with AI-powered resume optimization. ATS scoring, skill gap analysis, and expert suggestions.",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body className="bg-background text-primary-text font-body antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          <UserProvider>
            <ToastProvider>
              {children}
            </ToastProvider>
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
