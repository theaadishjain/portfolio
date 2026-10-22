import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aadish Jain — Portfolio",
  description:
    "Computer Science undergraduate at SRM Institute of Science and Technology, specializing in Deep Learning and Agentic AI workflows.",
  keywords: [
    "Aadish Jain",
    "portfolio",
    "deep learning",
    "agentic AI",
    "LangGraph",
    "PyTorch",
    "Next.js",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body className="font-sans antialiased bg-[#f4ece4] text-[#1a1a1a] selection:bg-[#d34b32] selection:text-white min-h-screen relative">
        {/* Fixed Background Layers */}
        <div className="fixed inset-0 z-0 pointer-events-none">
          <div className="gradient-mesh" />
          <div className="bg-noise" />
        </div>

        {/* Page Content */}
        <div className="relative z-10">
          {children}
        </div>
      </body>
    </html>
  );
}
