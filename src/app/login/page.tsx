"use client";
import { motion } from "framer-motion";
import { useState } from "react";
import { signInWithGoogle, signUpWithEmail, loginWithEmail } from "./userAuth";
import { AuroraBackground } from "@/app/components/ui/aurora-background";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/app/store/authStore"; // Import Zustand store

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<string | null>(null); // State for role selection
  const router = useRouter();
  const { setUser, setRole: setUserRole } = useAuthStore(); // Zustand store

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setRole(e.target.value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      if (isSignUp) {
        if (!role) {
          throw new Error("Please select a role.");
        }
        const user = await signUpWithEmail(email, password, role);
        setUser(user); // Update Zustand store
        setUserRole(role); // Update Zustand store
        setMessage({
          text: "Account created successfully! Redirecting to demo...",
          type: "success",
        });
        setTimeout(() => {
          router.push("/demo");
        }, 1500);
      } else {
        const user = await loginWithEmail(email, password);
        setUser(user); // Update Zustand store
        setMessage({
          text: "Login successful! Redirecting to dashboard...",
          type: "success",
        });
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setMessage({
        text: `Authentication failed: ${error instanceof Error ? error.message : "Unknown error"
          }`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const user = await signInWithGoogle();
      setUser(user); // Update Zustand store
      setMessage({
        text: "Sign in successful! Redirecting to dashboard...",
        type: "success",
      });
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      console.error("Google authentication error:", error);
      setMessage({
        text: `Google sign in failed: ${error instanceof Error ? error.message : "Unknown error"
          }`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSignUp = () => {
    setIsSignUp(!isSignUp);
    setMessage({ text: "", type: "" });
  };

  return (
    <AuroraBackground>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="flex flex-col items-center justify-center min-h-screen px-4"
      >
        {/* Welcome Text */}
        <motion.h1
          key={isSignUp ? "signup-message" : "login-message"}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-2xl font-semibold text-center mb-6 text-gray-900"
        >
          {isSignUp
            ? "AI-powered Finance Interview Prep"
            : "Welcome Back! Log in to continue practicing."}
        </motion.h1>
        {/* Authentication Card */}
        <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-2xl w-96 p-8 border border-gray-200">
          <h2 className="text-3xl font-semibold text-center mb-6 text-gray-800">
            {isSignUp ? "Create Account" : "Log In"}
          </h2>

          {/* Success/Error Message */}
          {message.text && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`text-center p-3 mb-4 rounded-md ${message.type === "success"
                  ? "bg-green-100 text-green-700 border border-green-200"
                  : "bg-red-100 text-red-700 border border-red-200"
                }`}
            >
              {message.text}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="w-full">
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                value={email}
                onChange={handleEmailChange}
                required
                disabled={isLoading}
              />
            </div>
            <div className="w-full">
              <input
                type="password"
                placeholder="Password"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                value={password}
                onChange={handlePasswordChange}
                required
                disabled={isLoading}
              />
            </div>
            {isSignUp && (
              <div className="w-full">
                <div className="w-full">
                  <label htmlFor="role-select" className="sr-only">
                    Select your role
                  </label>
                  <select
                    id="role-select"
                    value={role || ""}
                    onChange={handleRoleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                    required
                    disabled={isLoading}
                  >
                    <option value="" disabled>
                      Select your role
                    </option>
                    <option value="Investment Banking">Investment Banking (IB)</option>
                    <option value="Private Equity">Private Equity (PE)</option>
                    <option value="Hedge Funds">Hedge Funds (HF)</option>
                    <option value="Equity Research">Equity Research (ER)</option>
                    <option value="Asset Management">Asset Management (AM)</option>
                    <option value="Corporate Finance">Corporate Finance (CF)</option>
                  </select>
                </div>
              </div>
            )}
            <button
              type="submit"
              className={`w-full bg-gray-700 text-white px-4 py-2 rounded-md transition ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-800"
                }`}
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-black"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Processing...
                </span>
              ) : (
                isSignUp ? "Sign Up" : "Log In"
              )}
            </button>
          </form>
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              className={`w-full bg-gray-500 text-white px-4 py-2 rounded-md transition ${isLoading ? "opacity-70 cursor-not-allowed" : "hover:bg-gray-600"
                }`}
              disabled={isLoading}
            >
              Sign in with Google
            </button>
          </div>
          <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
              {" "}
              <button
                type="button"
                className="text-gray-700 font-semibold hover:underline bg-transparent border-none cursor-pointer p-0"
                onClick={toggleSignUp}
                disabled={isLoading}
              >
                {isSignUp ? "Log in" : "Sign up"}
              </button>
            </p>
          </div>
        </div>
      </motion.div>
    </AuroraBackground>
  );
}