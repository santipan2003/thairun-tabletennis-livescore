import React, { ReactNode } from "react";
import Head from "next/head";
import Navbar from "./Navbar";
import Footer from "./Footer";

interface LayoutProps {
  children: ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = "THAIRUN | TABLE TENNIS",
}) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Head>
        <title>{title}</title>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      {/* Grouping Navbar, Main, and Footer in one responsive container */}
      <div className="flex flex-col flex-1 bg-white dark:bg-gray-900">
        {/* Navbar */}
        <Navbar />

        {/* Main Content */}
        <main className="flex-1">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
