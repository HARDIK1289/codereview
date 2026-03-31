import "./globals.css";
import CustomCursor from "@/components/ui/CustomCursor";
import SessionWrapper from "@/components/SessionWrapper"; // Import the wrapper

export const metadata = {
  title: "CodeVibe | AI Code Readability Platform",
  description: "Analyze, understand, and improve code readability with AI.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased selection:bg-cyan-500/30 selection:text-cyan-200">
        <SessionWrapper> {/* ✅ Wrap everything here */}
          <CustomCursor />
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}