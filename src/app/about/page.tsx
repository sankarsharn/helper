"use client";
import React from "react";
import { motion } from "framer-motion";
import { LampContainer } from "@/app/components/ui/lamp";
import { CheckCircleIcon } from "lucide-react";

const features = [
  "AI-Powered Mock Interviews – Real-time feedback on behavioral and technical responses.",
  "Role-Specific Question Bank – Flashcards and quizzes on valuation, M&A, and LBO modeling.",
  "Case Study & Financial Modeling – Hands-on challenges with AI-driven feedback.",
  "Progress Tracking & Insights – Measure improvement over time.",
  "Seamless Integration – Google Sheets & Excel support for finance modeling.",
];

const About = () => {
  return (
    <div className="text-white bg-gray-950 min-h-screen pb-16"> {/* Added pb-16 for proper spacing */}
      <LampContainer className="bg-gray-950">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="mt-8 bg-gradient-to-br from-gray-200 to-gray-500 py-4 bg-clip-text text-center text-4xl font-bold tracking-tight text-transparent md:text-6xl"
        >
          Prepare for Your Next Finance Interview <br /> the Right Way
        </motion.h1>
      </LampContainer>

      {/* About Section */}
      <div className="max-w-4xl mx-auto text-center mt-10 px-6">
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-gray-400 text-lg md:text-xl leading-relaxed"
        >
          This app is an AI-Powered Finance Job Prep Platform designed to help
          finance professionals and aspiring candidates prepare for competitive
          roles such as <span className="text-gray-200 font-semibold">Investment Banking, Private Equity, Hedge Funds, Equity Research, Asset Management, and Corporate Finance</span>.
        </motion.p>
      </div>

      {/* Features Section */}
      <div className="max-w-5xl mx-auto mt-12 px-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
          className="text-center text-3xl font-semibold text-gray-200"
        >
          Why Choose Us?
        </motion.h2>

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="flex items-start space-x-3 bg-gray-900 p-4 rounded-xl shadow-lg"
            >
              <CheckCircleIcon className="text-green-400 w-6 h-6 mt-1" />
              <p className="text-gray-300 text-lg leading-relaxed">{feature}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default About;
