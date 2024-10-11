import React, { useState } from "react";
import { Menu } from "lucide-react"; // Example Shadcn icon
import { Button } from "@/components/ui/button"; // Import button from Shadcn
import Link from "next/link"; // Import Link from next.js

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex-shrink-0 flex items-center">
            <h1 className="text-xl font-semibold">Admin</h1>
          </div>
          <div className="hidden md:flex space-x-4 items-center">
            <Link href="/" className="text-gray-800 hover:text-gray-600">
              Home
            </Link>
            <Link
              href="/admin/tournament"
              className="text-gray-800 hover:text-gray-600"
            >
              Tournament
            </Link>
          </div>
          <div className="flex items-center md:hidden">
            <Button
              onClick={() => setIsOpen(!isOpen)}
              variant="outline"
              size="icon"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              href="/"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-gray-600 hover:bg-gray-100"
            >
              Home
            </Link>
            <Link
              href="/admin/tournament"
              className="block px-3 py-2 rounded-md text-base font-medium text-gray-800 hover:text-gray-600 hover:bg-gray-100"
            >
              Tournament
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
