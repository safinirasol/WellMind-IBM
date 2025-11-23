import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { Plus_Jakarta_Sans } from "next/font/google";
import { ToastProvider } from "./components/Toast";
import WxoPreloader from "./components/WxoPreloader";

export const metadata = {
  title: "vorteX Health",
  description:
    "Healthcare-grade burnout intelligence with orchestration and ledger auditability",
};

const fontSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`page-shell ${fontSans.variable} font-sans`}>
        {/* Preload Watson loader early to reduce first open latency */}
        <WxoPreloader />
        <ToastProvider>
          <Navbar />

          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-0 bg-gradient-radial" />

            <main className="relative container mx-auto px-6 md:px-10 py-10">
              {children}
            </main>
          </div>

          <Footer />
        </ToastProvider>

        {/*
          ⭐ GLOBAL IBM ORCHESTRATE MOUNT POINT
          - Must exist BEFORE the IBM script loads
          - Never unmounts, so the chat UI stays alive (no reloads)
        */}
        <div
          id="wxo-floating-panel-root"
          style={{
            display: "none",    // hidden until chat is opened
            width: "380px",
            height: "520px",
            position: "fixed",
            bottom: "24px",
            right: "24px",
            zIndex: 9999,
          }}
        >
          <div
            id="wxo-floating-panel"
            style={{ width: "100%", height: "100%" }}
          ></div>
        </div>
      </body>
    </html>
  );
}
