"use client";

import React, { useEffect, useState } from "react";
import { auth } from "@/app/firebase/firebase";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebase";
import { FaCheckCircle, FaChartLine, FaFileAlt } from "react-icons/fa"; // Icons for cards

const Page = () => {
  const [questionsSolved, setQuestionsSolved] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [interviewsGiven, setInterviewsGiven] = useState(0);
  const [caseStudiesPerformed, setCaseStudiesPerformed] = useState(0);

  // Fetch user data from Firestore
  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setQuestionsSolved(userData.solvedQuestions?.length || 0);
        setTotalQuestions(userData.totalQuestions || 0);
        setInterviewsGiven(userData.interviewGiven || 0);
        setCaseStudiesPerformed(userData.caseStudy?.perWeek || 0);
      }
    }
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    if (totalQuestions === 0) return 0;
    return (questionsSolved / totalQuestions) * 100;
  };

  // Determine progress bar color
  const getProgressBarColor = () => {
    const progress = calculateProgress();
    if (progress < 33.3) return "bg-red-500";
    if (progress >= 33.3 && progress < 66.7) return "bg-yellow-500";
    return "bg-green-500";
  };

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 to-black text-white p-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Track Your Progress So Far!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {/* Card 1: Questions Solved */}
        <div className="bg-neutral-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-neutral-700">
          <div className="flex items-center mb-4">
            <FaCheckCircle className="text-3xl text-green-500 mr-4" />
            <h2 className="text-2xl font-semibold">Questions Solved</h2>
          </div>
          <p className="text-gray-400 mb-4">
            {questionsSolved} / {totalQuestions}
          </p>
          <div className="w-full bg-neutral-700 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${getProgressBarColor()} transition-all duration-500`}
              style={{ width: `${calculateProgress()}%` }}
            ></div>
          </div>
        </div>

        {/* Card 2: Interviews Given */}
        <div className="bg-neutral-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-neutral-700">
          <div className="flex items-center mb-4">
            <FaChartLine className="text-3xl text-blue-500 mr-4" />
            <h2 className="text-2xl font-semibold">Interviews Given</h2>
          </div>
          <p className="text-gray-400 mb-4">{interviewsGiven}</p>
        </div>

        {/* Card 3: Case Studies Performed */}
        <div className="bg-neutral-800 p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300 border border-neutral-700">
          <div className="flex items-center mb-4">
            <FaFileAlt className="text-3xl text-purple-500 mr-4" />
            <h2 className="text-2xl font-semibold">Case Studies Performed</h2>
          </div>
          <p className="text-gray-400 mb-4">{caseStudiesPerformed}</p>
        </div>
      </div>
    </div>
  );
};

export default Page;