"use client";

import React, { useEffect, useState } from "react";
import { auth } from "../firebase/firebase";
import { onAuthStateChanged, User } from "firebase/auth";

const Pricing = () => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const plans = [
    {
      title: "Free",
      price: "$0/month",
      features: [
        "3 AI mock interviews per week",
        "Basic question bank",
        "No case study practice",
        "No progress tracking",
      ],
    },
    {
      title: "Pro",
      price: "$2/month",
      features: [
        "Unlimited mock interviews",
        "Full access to advanced question bank",
        "2 case study practices",
        "Progress tracking",
      ],
    },
    {
      title: "Premium",
      price: "$3/month",
      features: [
        "Unlimited AI-powered mock interviews with deep feedback",
        "Full access to advanced question bank",
        "Unlimited case study practice",
        "Progress tracking",
      ],
    },
  ];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-8">
      <h1 className="text-4xl font-bold mb-10 text-purple-400">Choose Your Plan</h1>
      
      <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl">
        {plans.map((plan, index) => (
          <div
            key={index}
            className="flex-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg transition-transform duration-300 hover:scale-105 flex flex-col p-6 backdrop-blur-md bg-opacity-80"
          >
            <h2 className="text-2xl font-bold mb-2">{plan.title}</h2>
            <p className="text-3xl font-extrabold mb-6 text-purple-400">
              {plan.price}
            </p>

            <div className="space-y-4 mb-8 flex-grow">
              {plan.features.map((feature, i) => (
                <div key={i} className="flex items-start">
                  <div className="mr-3 mt-1 text-purple-400">
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <p className={`${i === 0 ? "font-semibold" : "text-gray-300"}`}>
                    {feature}
                  </p>
                </div>
              ))}
            </div>

            {user ? (
              <button className="w-full py-3 px-4 rounded-md font-medium transition-all cursor-pointer bg-purple-500 hover:bg-purple-600 text-white mt-auto">
                Choose Plan
              </button>
            ) : (
              <p className="text-sm text-gray-400">Login to select a plan</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pricing;
