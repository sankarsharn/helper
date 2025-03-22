"use client";

import React, { useState, useEffect, useRef } from "react";
import { BrainCircuit } from "lucide-react";
import questions from "@/behavorial/behavorial.json";

const API_URL = "http://localhost:5000";

const Page = () => {
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [botAnswer, setBotAnswer] = useState(""); // Store bot's answer
  const [score, setScore] = useState(null); // Store user's score
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isAnswerEvaluated, setIsAnswerEvaluated] = useState(false); // Track if answer is evaluated
  const [showBotAnswer, setShowBotAnswer] = useState(false); // Control showing the bot answer
  const modalRef = useRef(null);

  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  const handleStartInterview = () => {
    const shuffledQuestions = shuffleArray([...questions]).slice(0, 20);
    setSelectedQuestions(shuffledQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setBotAnswer("");
    setScore(null);
    setIsAnswerEvaluated(false);
    setShowBotAnswer(false);
    setIsDialogOpen(true);
  };

  const fetchBotAnswer = async (question) => {
    try {
      // Step 1: Send the question to the bot
      await fetch(`${API_URL}/receive-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      // Step 2: Get the AI-generated response
      const response = await fetch(`${API_URL}/bot-answer`, { method: "GET" });
      const data = await response.json();
      setBotAnswer(data.bot_answer);
    } catch (error) {
      console.error("Error fetching bot response:", error);
      setBotAnswer("Could not load example answer. Please try again.");
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim()) return;
    setIsEvaluating(true);
    try {
      // First fetch the bot answer if we haven't already
      if (!botAnswer) {
        await fetchBotAnswer(selectedQuestions[currentQuestionIndex].question);
      }

      // Step 3: Submit user's answer
      await fetch(`${API_URL}/submit-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: userAnswer }),
      });

      // Step 4: Get evaluation score
      const response = await fetch(`${API_URL}/evaluate`, { method: "GET" });
      const data = await response.json();
      setScore(data.evaluation);
      setIsAnswerEvaluated(true); // Hide answer box after evaluation
      setShowBotAnswer(true); // Now show the bot answer
    } catch (error) {
      console.error("Error evaluating answer:", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setUserAnswer("");
      setBotAnswer("");
      setScore(null);
      setIsAnswerEvaluated(false);
      setShowBotAnswer(false);
    } else {
      setIsDialogOpen(false);
    }
  };

  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setIsDialogOpen(false);
    }
  };

  useEffect(() => {
    if (isDialogOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDialogOpen]);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center">
      <BrainCircuit size={80} className="text-black-600 mb-4" />
      <h1 className="text-3xl font-semibold text-gray-800">
        Start Your Behavioral Interview
      </h1>
      <p className="text-gray-600 mt-2">
        Our AI-powered system will guide you through the process.
      </p>

      <button
        onClick={handleStartInterview}
        className="mt-6 px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition cursor-pointer"
      >
        Begin Interview
      </button>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div
            ref={modalRef}
            className="bg-white rounded-lg shadow-lg w-full max-w-lg p-6 max-h-[90vh] flex flex-col"
          >
            {/* Question Section (Always Visible) */}
            <div className="flex-shrink-0">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                Question {currentQuestionIndex + 1} of {selectedQuestions.length}
              </h2>
              <p className="text-gray-700 mb-4">
                {selectedQuestions[currentQuestionIndex]?.question || "Loading question..."}
              </p>
            </div>

            {/* Scrollable Content Section */}
            <div className="flex-1 overflow-y-auto">
              {/* Bot's Answer (Visible after evaluation) */}
              

              {/* User's Score (Visible after evaluation) */}
              {isAnswerEvaluated && (
                <div className="p-3 bg-gray-100 rounded-lg text-left mb-4">
                  <strong>Your Score:</strong>
                  <p className="text-gray-700 mt-2">{score}/10</p>
                </div>
              )}

              {/* Answer Box and Evaluate Button (Hidden after evaluation) */}
              {!isAnswerEvaluated && (
                <div className="mb-4">
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    placeholder="Type your answer here..."
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 mb-4"
                    rows={4}
                  />

                  <button
                    onClick={handleEvaluateAnswer}
                    className={`w-full px-6 py-3 rounded-lg shadow-md transition cursor-pointer ${
                      isEvaluating
                        ? "bg-gray-400"
                        : "bg-gray-600 hover:bg-gray-700 text-white"
                    }`}
                    disabled={isEvaluating}
                  >
                    {isEvaluating ? "Evaluating..." : "Evaluate Answer"}
                  </button>
                </div>
              )}
            </div>

            {/* Next Question or Finish Button (Always Visible) */}
            <div className="flex-shrink-0">
              <button
                onClick={handleNextQuestion}
                className={`w-full px-6 py-3 rounded-lg shadow-md transition cursor-pointer ${
                  isEvaluating
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gray-600 hover:bg-gray-700 text-white"
                }`}
                disabled={isEvaluating} // Disable button during evaluation
              >
                {currentQuestionIndex < selectedQuestions.length - 1
                  ? "Next Question"
                  : "Finish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;