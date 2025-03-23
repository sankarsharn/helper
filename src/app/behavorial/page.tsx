"use client";

import React, { useState, useEffect, useRef } from "react";
import { BrainCircuit, Mic, MicOff } from "lucide-react"; // Import microphone icons
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebase";
import questions from "@/behavorial/behavorial.json";

const API_URL = "http://localhost:5000";

const Page = () => {
  const router = useRouter();
  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userAnswer, setUserAnswer] = useState("");
  const [botAnswer, setBotAnswer] = useState("");
  const [score, setScore] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isAnswerEvaluated, setIsAnswerEvaluated] = useState(false);
  const [showBotAnswer, setShowBotAnswer] = useState(false);
  const [interviewCount, setInterviewCount] = useState(3);
  const [userPlan, setUserPlan] = useState(0);
  const [isListening, setIsListening] = useState(false); // Track speech recognition state
  const recognitionRef = useRef(null); // Ref for SpeechRecognition object
  const modalRef = useRef(null);

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Stop after one sentence
      recognitionRef.current.interimResults = false; // Only final results
      recognitionRef.current.lang = "en-US"; // Set language

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setUserAnswer((prev) => prev + " " + transcript); // Append recognized text
        setIsListening(false); // Stop listening after result
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.warn("Speech recognition not supported in this browser.");
    }
  }, []);

  // Start/stop speech recognition
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Shuffle array function
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // Fetch user data (plan, interview count, and interviewGiven)
  const fetchUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        setUserPlan(userData.plan || 0);

        // Set interview count (only default to 3 if interview is undefined or null)
        const interviews = userData.interview;
        setInterviewCount(interviews !== undefined && interviews !== null ? interviews : 3);
      }
    }
  };

  // Handle starting the interview
  const handleStartInterview = async () => {
    if (userPlan === 0 && interviewCount <= 0) {
      alert("No interviews remaining. Please upgrade your plan.");
      return;
    }

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

  // Fetch bot's answer
  const fetchBotAnswer = async (question) => {
    try {
      await fetch(`${API_URL}/receive-question`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      const response = await fetch(`${API_URL}/bot-answer`, { method: "GET" });
      const data = await response.json();
      setBotAnswer(data.bot_answer);
    } catch (error) {
      console.error("Error fetching bot response:", error);
      setBotAnswer("Could not load example answer. Please try again.");
    }
  };

  // Evaluate user's answer
  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim()) return;
    setIsEvaluating(true);
    try {
      if (!botAnswer) {
        await fetchBotAnswer(selectedQuestions[currentQuestionIndex].question);
      }

      await fetch(`${API_URL}/submit-answer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answer: userAnswer }),
      });

      const response = await fetch(`${API_URL}/evaluate`, { method: "GET" });
      const data = await response.json();
      setScore(data.evaluation);
      setIsAnswerEvaluated(true);
      setShowBotAnswer(true);
    } catch (error) {
      console.error("Error evaluating answer:", error);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Move to the next question or finish the interview
  const handleNextQuestion = async () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setUserAnswer("");
      setBotAnswer("");
      setScore(null);
      setIsAnswerEvaluated(false);
      setShowBotAnswer(false);
    } else {
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const updatedInterviewGiven = (userData.interviewGiven || 0) + 1; // Increase interviewGiven by 1

          // Update Firestore with new interviewGiven and interview count (if free plan)
          const updates = {
            interviewGiven: updatedInterviewGiven,
          };

          if (userPlan === 0) {
            const updatedInterviewCount = interviewCount - 1;
            updates.interview = updatedInterviewCount;
            setInterviewCount(updatedInterviewCount); // Update local state
          }

          await updateDoc(doc(db, "users", user.uid), updates);
        }
      }

      setIsDialogOpen(false);
      router.push("/interview"); // Redirect to the interview page
    }
  };

  // Prevent closing the modal during the interview
  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      event.preventDefault(); // Prevent closing the modal
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

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center">
      <BrainCircuit size={80} className="text-black-600 mb-4" />
      <h1 className="text-3xl font-semibold text-gray-800">
        Start Your Behavioral Interview
      </h1>
      <p className="text-gray-600 mt-2">
        Our AI-powered system will guide you through the process.
      </p>

      {/* Show interview count for free plan users */}
      {userPlan === 0 && (
        <p className="text-gray-600 mt-2">
          Interviews Remaining: {interviewCount}
        </p>
      )}

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
              {showBotAnswer && (
                <div className="p-3 bg-gray-100 rounded-lg text-left mb-4">
                  <strong>Example Answer:</strong>
                  <p className="text-gray-700 mt-2">{botAnswer}</p>
                </div>
              )}

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

                  {/* Microphone Button for Speech-to-Text */}
                  <button
                    onClick={toggleListening}
                    className={`w-full px-6 py-3 rounded-lg shadow-md transition cursor-pointer flex items-center justify-center gap-2 ${
                      isListening
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-gray-600 hover:bg-gray-700"
                    } text-white`}
                  >
                    {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    {isListening ? "Stop Listening" : "Start Speaking"}
                  </button>

                  <button
                    onClick={handleEvaluateAnswer}
                    className={`w-full px-6 py-3 rounded-lg shadow-md transition cursor-pointer ${
                      isEvaluating
                        ? "bg-gray-400"
                        : "bg-gray-600 hover:bg-gray-700 text-white"
                    } mt-4`}
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