"use client";

import React from 'react';
import Link from 'next/link';

const InterviewPage = () => {
  return (
    <div className="flex-1 p-6 bg-black min-h-screen">
      <h1 className="text-2xl font-bold text-gray-100">Mock Interview</h1>
      <p className="text-gray-400 mt-2">Select the type of interview you'd like to practice</p>

      {/* Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Card 1: Behavioral Interview */}
        <Link href="/behavorial">
          <div className="bg-gray-950 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-900">
            <h2 className="text-xl font-semibold text-gray-100">Behavioral Interview</h2>
            <p className="text-gray-400 mt-2">
              Practice answering questions about your past experiences, work style, and soft skills.
            </p>
            <div className="mt-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                />
              </svg>
              <span className="text-sm text-gray-300">15+ Question Types</span>
            </div>
            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Start Behavioral Interview
            </button>
          </div>
        </Link>

        {/* Card 2: Technical Interview */}
        <Link href="/technical">
          <div className="bg-gray-950 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer border border-gray-900">
            <h2 className="text-xl font-semibold text-gray-100">Technical Interview</h2>
            <p className="text-gray-400 mt-2">
              Practice technical questions specific to your role and get AI-powered feedback.
            </p>
            <div className="mt-4 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-2 text-gray-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              <span className="text-sm text-gray-300">Role-Specific Questions</span>
            </div>
            <button className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
              Start Technical Interview
            </button>
          </div>
        </Link>
      </div>

      {/* Additional Information */}
      <div className="mt-10 bg-gray-950 p-6 rounded-lg shadow border border-gray-900">
        <h2 className="text-xl font-semibold text-gray-100">About Mock Interviews</h2>
        <p className="text-gray-400 mt-2">
          Our AI-powered mock interviews simulate real interview experiences and provide personalized feedback to help you improve.
          Each session is designed to help you build confidence and develop better responses.
        </p>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-gray-900 p-2 rounded-full">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-md font-medium text-gray-100">Detailed Feedback</h3>
              <p className="text-sm text-gray-400">Get actionable insights on your answers</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-gray-900 p-2 rounded-full">
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-md font-medium text-gray-100">Realistic Scenarios</h3>
              <p className="text-sm text-gray-400">Questions based on real interviews</p>
            </div>
          </div>
          <div className="flex items-start">
            <div className="flex-shrink-0 bg-gray-900 p-2 rounded-full">
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
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-md font-medium text-gray-100">Track Progress</h3>
              <p className="text-sm text-gray-400">Review and improve over time</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewPage;