import "./globals.css";

export const metadata = {
  title: "VA Marketplace",
  description: "Pre-Verified Virtual Assistant Marketplace",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

