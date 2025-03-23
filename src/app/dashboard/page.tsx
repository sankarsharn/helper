"use client";
import { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import RoleSelectionModal from "../components/RoleSelectionModal";
import { updateUserRole } from "@/app/login/userAuth";
import Link from "next/link";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userPlan, setUserPlan] = useState<number>(0); // Default to free plan
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 0
  );
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const role = userData.role;
          setUserRole(role);

          // Get user plan, default to 0 (free) if not set
          const plan = userData.plan !== undefined ? userData.plan : 0;
          setUserPlan(plan);

          // Show modal only if role is null
          if (role === null) {
            setIsModalOpen(true);
          }
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Handle responsive behavior
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    // Set initial state based on window width
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleRoleSelect = async (role: string) => {
    if (auth.currentUser) {
      await updateUserRole(auth.currentUser.uid, role);
      setUserRole(role); // Update local state
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Handler for progress link clicks
  const handleProgressClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (userPlan === 0) {
      // Free plan
      router.push("/pricing");
    } else {
      router.push("/progress");
    }
  };

  return (
    <div className="flex h-screen bg-neutral-900"> {/* Dark background */}
      {/* Sidebar */}
      <div
        className={`bg-neutral-800 shadow-lg transition-all duration-300 flex flex-col ${
          isSidebarOpen ? "w-64" : "w-16"
        }`}
      >
        <div className="p-4">
          {/* Collapse Button */}
          <button
            onClick={toggleSidebar}
            className="text-gray-300 hover:text-gray-100 focus:outline-none"
          >
            {isSidebarOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              </svg>
            )}
          </button>
        </div>

        {/* Sidebar Links */}
        <nav className="mt-4 space-y-2 px-4 flex-grow">
          <Link
            href="/dashboard"
            className="flex items-center p-3 text-gray-300 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <div className="min-w-6 flex justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                />
              </svg>
            </div>
            {isSidebarOpen && <span className="ml-2">Dashboard</span>}
          </Link>
          {/* Progress link with conditional redirect */}
          <a
            href="#"
            onClick={handleProgressClick}
            className="flex items-center p-3 text-gray-300 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <div className="min-w-6 flex justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            {isSidebarOpen && (
              <span className="ml-2">
                Progress
                {userPlan === 0 && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 inline-block ml-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                )}
              </span>
            )}
          </a>
          <Link
            href="/pricing"
            className="flex items-center p-3 text-gray-300 hover:bg-neutral-700 rounded-lg transition-colors"
          >
            <div className="min-w-6 flex justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            {isSidebarOpen && <span className="ml-2">Subscription</span>}
          </Link>
        </nav>

        {/* User Role at the Bottom (now properly inside the sidebar) */}
        <div className="p-4 bg-neutral-700 mt-auto">
          {isSidebarOpen ? (
            <div>
              <p className="text-sm text-gray-300">
                Role: <span className="font-semibold">{userRole || "Not set"}</span>
              </p>
              <p className="text-sm text-gray-300 mt-1">
                Plan: <span className="font-semibold">{userPlan === 0 ? "Free" : "Premium"}</span>
              </p>
            </div>
          ) : (
            <div className="flex justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <h1 className="text-2xl font-bold text-gray-200">Dashboard</h1>
        <p className="text-gray-400 mt-2">
          Your current role: {userRole || "Not set"}
        </p>

        {/* Cards Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {/* Card 1: Question Page */}
          <Link href="/question">
            <div className="bg-neutral-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer">
              <h2 className="text-xl font-semibold text-gray-200">
                Question Bank
              </h2>
              <p className="text-gray-400 mt-2">
                Practice questions tailored to your role.
              </p>
              <button className="mt-4 px-4 py-2 bg-neutral-700 text-gray-200 rounded-lg hover:bg-neutral-600 transition-colors">
                Go to Questions
              </button>
            </div>
          </Link>

          {/* Card 2: AI-Powered Mock Interview */}
          <Link href="/interview">
            <div className="bg-neutral-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer">
              <h2 className="text-xl font-semibold text-gray-200">
                AI-Powered Mock Interview
              </h2>
              <p className="text-gray-400 mt-2">
                Simulate real interviews with AI feedback.
              </p>
              <button className="mt-4 px-4 py-2 bg-neutral-700 text-gray-200 rounded-lg hover:bg-neutral-600 transition-colors">
                Start Interview
              </button>
            </div>
          </Link>

          {/* Card 3: Progress Tracking with conditional redirect */}
          <div
            onClick={handleProgressClick}
            className="bg-neutral-800 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
          >
            <div className="flex justify-between items-start">
              <h2 className="text-xl font-semibold text-gray-200">
                Progress Tracking
              </h2>
              {userPlan === 0 && (
                <span className="bg-yellow-800 text-yellow-100 text-xs font-medium px-2.5 py-0.5 rounded">
                  Premium
                </span>
              )}
            </div>
            <p className="text-gray-400 mt-2">
              {userPlan === 0
                ? "Upgrade to track your progress and performance."
                : "Track your progress and performance."}
            </p>
            <button className="mt-4 px-4 py-2 bg-neutral-700 text-gray-200 rounded-lg hover:bg-neutral-600 transition-colors">
              {userPlan === 0 ? "Upgrade Now" : "View Progress"}
            </button>
          </div>
        </div>
      </div>

      {/* Role Selection Modal */}
      <RoleSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRoleSelect={handleRoleSelect}
      />
    </div>
  );
};

export default Dashboard;