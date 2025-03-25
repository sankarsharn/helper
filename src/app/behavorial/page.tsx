"use client";
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useRef } from "react";
import { BrainCircuit, Mic, MicOff, ChevronRight, User, Bot } from "lucide-react";
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "@/app/firebase/firebase";
import questions from "@/behavorial/behavorial.json";

const API_URL = "http://localhost:5000";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const Page = () => {
  const router = useRouter();
  interface Question {
    question: string;
  }

  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
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
  const [isListening, setIsListening] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState("");
  const [isFollowUp, setIsFollowUp] = useState(false);
  interface Message {
    role: string;
    content: string;
    id: string;
  }
  interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: unknown;  // Safer alternative to any
  emma: Document | null;
}
  
  interface SpeechRecognitionErrorEvent extends Event {
    error: string;
    message: string;
  }

  const [chatHistory, setChatHistory] = useState<Message[]>([]);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds
  const [questionTimeLeft, setQuestionTimeLeft] = useState(240); // 4 minutes per question in seconds
  const [timerActive, setTimerActive] = useState(false);
  const [questionTimerActive, setQuestionTimerActive] = useState(false);
  
  const recognitionRef = useRef<Window['SpeechRecognition'] | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const questionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load interview progress from localStorage
  useEffect(() => {
    const savedInterview = localStorage.getItem('behavioralInterviewProgress');
    if (savedInterview) {
      try {
        const {
          selectedQuestions,
          currentQuestionIndex,
          chatHistory,
          timeLeft,
          questionTimeLeft,
          isDialogOpen
        } = JSON.parse(savedInterview);
        
        if (isDialogOpen) {
          setSelectedQuestions(selectedQuestions || []);
          setCurrentQuestionIndex(currentQuestionIndex || 0);
          setChatHistory(chatHistory || []);
          setTimeLeft(timeLeft || 3600);
          setQuestionTimeLeft(questionTimeLeft || 240);
          setIsDialogOpen(true);
          setTimerActive(true);
          setQuestionTimerActive(true);
        }
      } catch (e) {
        console.error("Failed to load interview progress", e);
      }
    }
  }, []);

  // Save interview progress to localStorage
  useEffect(() => {
    if (isDialogOpen) {
      const interviewProgress = {
        selectedQuestions,
        currentQuestionIndex,
        chatHistory,
        timeLeft,
        questionTimeLeft,
        isDialogOpen
      };
      localStorage.setItem('behavioralInterviewProgress', JSON.stringify(interviewProgress));
    } else {
      localStorage.removeItem('behavioralInterviewProgress');
    }
  }, [selectedQuestions, currentQuestionIndex, chatHistory, timeLeft, questionTimeLeft, isDialogOpen]);

  // Total timer logic
  useEffect(() => {
    if (timerActive) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current as NodeJS.Timeout);
            handleInterviewTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [timerActive]);

  // Per-question timer logic
  useEffect(() => {
    if (questionTimerActive) {
      questionTimerRef.current = setInterval(() => {
        setQuestionTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(questionTimerRef.current as NodeJS.Timeout);
            handleQuestionTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (questionTimerRef.current) {
        clearInterval(questionTimerRef.current);
      }
    };
  }, [questionTimerActive, currentQuestionIndex]);

  const handleQuestionTimeout = () => {
    // Add timeout message to chat history
    addBotMessage("Time for this question has ended. Moving to the next question.");
    
    // Move to next question or finish interview
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      handleNextQuestion();
    } else {
      handleFinishInterview();
    }
  };

  const handleInterviewTimeout = async () => {
    // Add timeout message to chat history
    addBotMessage("Your interview time has ended. The session will now conclude.");
    handleFinishInterview();
  };

  const handleFinishInterview = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updatedInterviewGiven = (userData.interviewGiven || 0) + 1;

        // Update Firestore with new interviewGiven and interview count (if free plan)
        const updates = {
          interviewGiven: updatedInterviewGiven,
        };

        if (userPlan === 0) {
          const updatedInterviewCount = interviewCount - 1;
          (updates as { interviewGiven: any; interview: any }).interview = updatedInterviewCount;
          setInterviewCount(updatedInterviewCount);
        }

        await updateDoc(doc(db, "users", user.uid), updates);
      }
    }

    // Stop all timers
    setTimerActive(false);
    setQuestionTimerActive(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
    }

    // Delay closing to allow user to read the completion message
    setTimeout(() => {
      setIsDialogOpen(false);
      localStorage.removeItem('behavioralInterviewProgress');
      router.push("/interview");
    }, 3000);
  };

  // Format time for display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Initialize SpeechRecognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    
    if (SpeechRecognition) {
      // Clean up previous instance if it exists
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
      }
      
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        
        if (isFollowUp) {
          setFollowUpQuestion((prev) => prev ? prev + " " + transcript : transcript);
        } else {
          setUserAnswer((prev) => prev ? prev + " " + transcript : transcript);
        }
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      console.warn("Speech recognition not supported in this browser.");
    }
    
    // Clean up function
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
      }
    };
  }, [isFollowUp]);

  // Improved scroll to bottom function
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Scroll to bottom when chat history updates
  useEffect(() => {
    // Small delay to ensure DOM has updated
    const timeoutId = setTimeout(scrollToBottom, 100);
    return () => clearTimeout(timeoutId);
  }, [chatHistory]);

  // Toggle listening function
  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // Handlers for speech buttons
  const handleRegularSpeech = () => {
    setIsFollowUp(false);
    setTimeout(() => toggleListening(), 10);
  };

  const handleFollowUpSpeech = () => {
    setIsFollowUp(true);
    setTimeout(() => toggleListening(), 10);
  };

  // Function to add a bot message without typing animation
  const addBotMessage = (message: string) => {
    const messageId = Date.now().toString();
    
    // Add the complete message immediately
    setChatHistory(prev => [
      ...prev,
      { role: "system", content: message, id: messageId }
    ]);
    
    return messageId;
  };

  // Shuffle array function
  const shuffleArray = (array: any[]) => {
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

    const shuffledQuestions = shuffleArray([...questions]).slice(0, 15); // Changed to 15 questions
    setSelectedQuestions(shuffledQuestions);
    setCurrentQuestionIndex(0);
    setUserAnswer("");
    setBotAnswer("");
    setScore(null);
    setIsAnswerEvaluated(false);
    setShowBotAnswer(false);
    setIsDialogOpen(true);
    setChatHistory([]);
    setTimeLeft(3600); // 1 hour total
    setQuestionTimeLeft(240); // 4 minutes per question
    setTimerActive(true);
    setQuestionTimerActive(true);

    // Add initial system message introducing the interview
    setTimeout(() => {
      const welcomeMsg = "Welcome to your behavioral interview. You'll have 4 minutes per question and 1 hour total. I'll be asking you about your past experiences and how you handled different situations. Let's begin with the first question:";
      addBotMessage(welcomeMsg);
      
      // Add first question immediately after welcome message
      setTimeout(() => {
        if (shuffledQuestions[0]?.question) {
          addBotMessage(shuffledQuestions[0].question);
        }
      }, 500);
    }, 500);
  };

  // Fetch bot's answer when a new question loads
  useEffect(() => {
    if (isDialogOpen && selectedQuestions[currentQuestionIndex]) {
      const question = selectedQuestions[currentQuestionIndex].question;
      fetchBotAnswer(question);
    }
  }, [currentQuestionIndex, isDialogOpen, selectedQuestions]);

  // Fetch bot's answer
  const fetchBotAnswer = async (question: string) => {
    setIsBotTyping(true);
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
    } finally {
      setIsBotTyping(false);
    }
  };

  // Evaluate user's answer
  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim()) return;
    
    // Add user's answer to chat history
    setChatHistory(prev => [
      ...prev,
      { role: "user", content: userAnswer, id: `user-${Date.now()}` }
    ]);
    
    setIsEvaluating(true);
    setIsBotTyping(true);
    
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
      
      // Extract only the numerical score (assuming format like "8/10 blah blah")
      const numericScore = typeof data.evaluation === 'string' 
        ? data.evaluation.split('/')[0] 
        : data.evaluation;
      
      setScore(numericScore);
      setIsAnswerEvaluated(true);
      setShowBotAnswer(true);
      
      // Add evaluation message
      addBotMessage(`Your answer has been evaluated. Score: ${numericScore}/10`);
      
      // Add model answer as a separate message
      addBotMessage(`Here's a model answer for reference: ${botAnswer}`);
      
      // Add follow-up prompt as a separate message
      addBotMessage("Feel free to ask any follow-up questions about this topic.");
      
    } catch (error) {
      console.error("Error evaluating answer:", error);
      addBotMessage("There was an error evaluating your answer. Please try again.");
    } finally {
      setIsEvaluating(false);
      setIsBotTyping(false);
    }
  };

  // Handle follow-up question
  const handleFollowUpQuestion = async () => {
    if (!followUpQuestion.trim()) return;
    
    // Add user's follow-up to chat history
    setChatHistory(prev => [
      ...prev,
      { role: "user", content: followUpQuestion, id: `user-${Date.now()}` }
    ]);
    
    setIsEvaluating(true);
    setIsBotTyping(true);
    
    try {
      const response = await fetch(`${API_URL}/continue`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input: followUpQuestion }),
      });
      const data = await response.json();
      
      // Add bot's response immediately without typing animation
      addBotMessage(data.bot_response);
      
      setFollowUpQuestion("");
    } catch (error) {
      console.error("Error handling follow-up question:", error);
      addBotMessage("There was an error processing your follow-up. Please try again.");
    } finally {
      setIsEvaluating(false);
      setIsBotTyping(false);
    }
  };

  // Move to the next question or finish the interview
  const handleNextQuestion = async () => {
    // Stop current question timer
    setQuestionTimerActive(false);
    if (questionTimerRef.current) {
      clearInterval(questionTimerRef.current);
    }

    if (currentQuestionIndex < selectedQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      setUserAnswer("");
      setBotAnswer("");
      setScore(null);
      setIsAnswerEvaluated(false);
      setShowBotAnswer(false);
      setIsFollowUp(false);
      setQuestionTimeLeft(240); // Reset to 4 minutes for new question
      setQuestionTimerActive(true); // Start timer for new question
      
      // Add transition message
      setIsBotTyping(true);
      addBotMessage("Moving on to the next question:");
      
      // Add next question immediately
      if (selectedQuestions[nextIndex]?.question) {
        addBotMessage(selectedQuestions[nextIndex].question);
      }
      setIsBotTyping(false);
      
    } else {
      handleFinishInterview();
    }
  };

  // Prevent closing the modal during the interview
  const handleClickOutside = (event: MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
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

  // Auto-submit when speech recognition completes
  useEffect(() => {
    if (!isListening) {
      if (isAnswerEvaluated && followUpQuestion.trim()) {
        handleFollowUpQuestion();
      } else if (!isAnswerEvaluated && userAnswer.trim()) {
        handleEvaluateAnswer();
      }
    }
  }, [isListening, userAnswer, followUpQuestion]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 text-center">
      <BrainCircuit size={80} className="text-indigo-500 mb-4" />
      <h1 className="text-3xl font-semibold text-white">
        Start Your Behavioral Interview
      </h1>
      <p className="text-gray-300 mt-2">
        Our AI-powered system will guide you through the process.
      </p>

      {/* Show interview count for free plan users */}
      {userPlan === 0 && (
        <p className="text-gray-300 mt-2">
          Interviews Remaining: {interviewCount}
        </p>
      )}

      <button
        onClick={handleStartInterview}
        className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition cursor-pointer"
      >
        Begin Interview
      </button>

      {isDialogOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50">
          <div
            ref={modalRef}
            className="bg-gray-800 rounded-lg shadow-xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden"
            role="dialog"
            aria-modal="true"
            aria-labelledby="interview-title"
          >
            {/* Header */}
            <div className="flex-shrink-0 p-4 border-b border-gray-700 bg-gray-800 sticky top-0 z-10">
              <div className="flex justify-between items-center">
                <div>
                  <h2 id="interview-title" className="text-xl font-semibold text-white">
                    Behavioral Interview
                  </h2>
                  <p className="text-sm text-gray-300">
                    Question {currentQuestionIndex + 1} of {selectedQuestions.length}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-sm bg-gray-700 px-3 py-1 rounded-full text-white">
                    Total: <span className="font-semibold text-indigo-300">{formatTime(timeLeft)}</span>
                  </div>
                  <div className="text-sm bg-gray-700 px-3 py-1 rounded-full text-white">
                    Question: <span className="font-semibold text-purple-300">{formatTime(questionTimeLeft)}</span>
                  </div>
                  {isAnswerEvaluated && score !== null && (
                    <div className="text-sm bg-gray-700 px-3 py-1 rounded-full text-white">
                      Score: <span className="font-semibold text-indigo-300">{score}/10</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Chat container with messages */}
            <div 
              ref={chatContainerRef}
              className="flex-1 overflow-y-auto p-4 bg-gray-900 scroll-smooth"
              aria-live="polite"
              style={{ scrollBehavior: 'smooth' }}
            >
              <div className="max-w-4xl mx-auto">
                {chatHistory.map((message, index) => (
                  <div
                    key={message.id || index}
                    className={`mb-4 max-w-3xl ${
                      message.role === "user" ? "ml-auto" : "mr-auto"
                    }`}
                    tabIndex={0}
                    aria-label={`${message.role === "user" ? "Your" : "Interviewer"} message: ${message.content}`}
                  >
                    <div className={`flex items-start gap-3 ${
                      message.role === "user" ? "flex-row-reverse" : "flex-row"
                    }`}>
                      {/* Avatar image */}
                      <div className={`flex-shrink-0 rounded-full p-2 ${
                        message.role === "user" 
                          ? "bg-indigo-700 text-white" 
                          : "bg-purple-800 text-white"
                      }`}>
                        {message.role === "user" 
                          ? <User size={20} /> 
                          : <Bot size={20} />
                        }
                      </div>
                      
                      {/* Message content */}
                      <div
                        className={`p-3 rounded-lg shadow-sm ${
                          message.role === "user"
                            ? "bg-indigo-600 text-white rounded-tr-none"
                            : "bg-gray-700 text-gray-100 rounded-tl-none"
                        } overflow-hidden break-words max-w-[calc(100%-40px)]`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                    </div>
                    <div className={`text-xs text-gray-400 mt-1 px-2 ${
                      message.role === "user" ? "text-right" : "text-left"
                    }`}>
                      {message.role === "user" ? "You" : "Interviewer"} • 
                      {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))}
                
                {isBotTyping && (
                  <div className="mb-4 max-w-3xl mr-auto">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 rounded-full p-2 bg-purple-800 text-white">
                        <Bot size={20} />
                      </div>
                      <div className="p-3 rounded-lg bg-gray-700 text-gray-100 rounded-tl-none">
                        <div className="flex space-x-2">
                          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "0ms" }}></div>
                          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "150ms" }}></div>
                          <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: "300ms" }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Empty div for scrolling to bottom */}
                <div ref={messagesEndRef} />
              </div>
            </div>

            {/* Input area */}
            <div className="flex-shrink-0 p-4 border-t border-gray-700 bg-gray-800 sticky bottom-0 z-10">
              <div className="flex flex-col space-y-4 max-w-4xl mx-auto">
                {/* Speech indicator */}
                <div className="w-full p-3 border border-gray-600 rounded-lg bg-gray-700 text-white shadow-sm">
                  {isListening ? (
                    <div className="flex items-center justify-center gap-2 text-indigo-300">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></div>
                      <span>Listening... Speak now</span>
                    </div>
                  ) : isAnswerEvaluated ? (
                    <div className="text-gray-400 text-center">
                      {followUpQuestion ? "Ready to submit follow-up" : "Press microphone to ask a follow-up question"}
                    </div>
                  ) : (
                    <div className="text-gray-400 text-center">
                      {userAnswer ? "Ready to submit answer" : "Press microphone to answer the question"}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3 justify-center">
                  {/* Microphone Button */}
                  <button
                    type="button"
                    onClick={isAnswerEvaluated ? handleFollowUpSpeech : handleRegularSpeech}
                    disabled={isEvaluating || isBotTyping}
                    className={`px-6 py-3 rounded-lg transition flex items-center justify-center gap-2 ${
                      isListening
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-indigo-600 hover:bg-indigo-700 text-white"
                    } ${(isEvaluating || isBotTyping) ? "opacity-50 cursor-not-allowed" : ""}`}
                    aria-label={isListening ? "Stop speaking" : "Start speaking"}
                  >
                    {isListening ? <MicOff size={24} /> : <Mic size={24} />}
                    <span className="hidden sm:inline">
                      {isAnswerEvaluated ? "Ask Follow-up" : "Answer Question"}
                    </span>
                  </button>
                  
                  {/* Next Question Button */}
                  {isAnswerEvaluated && (
                    <button
                      type="button"
                      onClick={handleNextQuestion}
                      disabled={isEvaluating || isBotTyping}
                      className={`px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 ${
                        (isEvaluating || isBotTyping) ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      aria-label={currentQuestionIndex < selectedQuestions.length - 1 ? "Next question" : "Finish interview"}
                    >
                      {currentQuestionIndex < selectedQuestions.length - 1
                        ? "Next Question"
                        : "Finish Interview"}
                      <ChevronRight size={20} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CSS animations */}
      <style jsx>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-25%); }
        }
        .animate-bounce {
          animation: bounce 1s infinite;
        }
      `}</style>
    </div>
  );
};

export default Page;