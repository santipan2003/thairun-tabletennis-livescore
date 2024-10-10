import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="bg-black text-white py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          <div className="text-sm">
            &copy; {new Date().getFullYear()} MyApp. All rights reserved.
          </div>
          <div className="space-x-4">
            <a
              href="/privacy-policy"
              className="hover:text-white transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="/terms-of-service"
              className="hover:text-white transition-colors"
            >
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
