import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { Toaster } from "react-hot-toast";

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0d0d0d",
};

export const metadata = {
  title: "Solar Tracker — Monitor Your Solar Energy",
  description:
    "Track your solar electricity generation and consumption daily. Beautiful mobile-first dashboard with charts, trends, and smart alerts.",
  keywords: "solar tracker, energy monitoring, solar panels, electricity tracker",
  manifest: "/manifest.json",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <meta
          name="apple-mobile-web-app-status-bar-style"
          content="black-translucent"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
      </head>
      <body className="min-h-full flex flex-col antialiased">
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#252525",
                color: "#e5e5e5",
                border: "1px solid #444444",
                borderRadius: "12px",
                fontSize: "0.9rem",
              },
              success: {
                iconTheme: {
                  primary: "#22c55e",
                  secondary: "#0d0d0d",
                },
              },
              error: {
                iconTheme: {
                  primary: "#ef4444",
                  secondary: "#0d0d0d",
                },
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
