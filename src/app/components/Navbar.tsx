"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { Button } from "./ui/button";
import { User } from "firebase/auth";
import { logout } from "@/app/login/userAuth";

const Navbar: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      router.push("/");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const navLinks = [
    { name: "About", path: "/about" },
    { name: "Pricing", path: "/pricing" },
    user ? { name: "Dashboard", path: "/dashboard" } : { name: "Login", path: "/login" },
  ];

  return (
    <>
      <div className="min-h-16" />
      <header className="fixed w-full top-0 z-50 bg-transparent">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex-shrink-0">
              <Link href="/" className="font-bold text-xl">
                Finance-interview
              </Link>
            </div>

            <nav className="hidden md:flex items-center">
              <ul className="flex items-center space-x-8">
                {navLinks.map((link) => (
                  <li key={link.path}>
                    <Link
                      href={link.path}
                      className={`relative py-2 text-sm font-medium transition-colors hover:text-gray-900 ${
                        pathname === link.path
                          ? "text-gray-900 after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-full after:bg-gray-900"
                          : "text-gray-600"
                      }`}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
                
                {/* Logout Button (only shown when user is logged in) */}
                {user && (
                  <li className="ml-4">
                    <Button 
                      onClick={handleLogout}
                      variant="outline" 
                      size="sm"
                      className="font-medium bg-white/80 hover:bg-white/95"
                    >
                      Logout
                    </Button>
                  </li>
                )}
              </ul>
            </nav>

            <div className="md:hidden flex items-center">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-white/80 hover:bg-white/95 rounded-full"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"}
                  />
                </svg>
              </Button>
            </div>
          </div>

          {isMenuOpen && (
            <div className="md:hidden absolute left-0 right-0 bg-white/95 backdrop-blur-md shadow-md mt-2 py-4 rounded-lg mx-4 z-50">
              <ul className="flex flex-col items-center space-y-4">
                {navLinks.map((link) => (
                  <li key={link.path} className="w-full text-center">
                    <Link
                      href={link.path}
                      className={`block py-2 text-sm font-medium ${
                        pathname === link.path ? "text-gray-900" : "text-gray-600"
                      } hover:text-gray-900`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
                
                {/* Logout Button (only shown when user is logged in) */}
                {user && (
                  <li className="w-full text-center pt-2 border-t border-gray-100">
                    <Button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      variant="ghost"
                      className="text-sm font-medium text-gray-600 hover:text-gray-900 w-full"
                    >
                      Logout
                    </Button>
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </header>
    </>
  );
};

export default Navbar;