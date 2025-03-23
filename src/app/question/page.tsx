"use client";

import React, { useState, useEffect, useRef } from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { auth } from '@/app/firebase/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/firebase';
import questionsData from '@/question/question.json';
import { CheckCircle, ChevronLeft, ChevronRight, BookOpen, Zap, Award, Lock } from 'lucide-react';

// Define the Question interface based on your JSON structure
interface Question {
  role: string;
  tags: string;
  question: string;
  answer: string;
}

// Define the structure of your JSON
interface QuestionsType {
  "Investment Banking": Question[];
  "Private Equity": Question[];
  "Hedge Funds": Question[];
  "Equity Research": Question[];
  "Asset Management": Question[];
  [key: string]: Question[]; // Add index signature for other potential roles
}

// Type assertion for your imported JSON
const questions = questionsData as QuestionsType;

const QuestionPage = () => {
  const [showAnswer, setShowAnswer] = useState<{ [key: string]: boolean }>({});
  const [userRole, setUserRole] = useState<string | null>(null);
  const [questionBankAccess, setQuestionBankAccess] = useState<number>(0); // 0 = free plan, 1 = paid plan
  const [loading, setLoading] = useState(true);
  const [basicQuestions, setBasicQuestions] = useState<Question[]>([]);
  const [advancedQuestions, setAdvancedQuestions] = useState<Question[]>([]);
  const [basicSlideIndex, setBasicSlideIndex] = useState(1);
  const [advancedSlideIndex, setAdvancedSlideIndex] = useState(1);
  const [solvedQuestions, setSolvedQuestions] = useState<Set<string>>(new Set()); // Track solved questions
  const [totalQuestions, setTotalQuestions] = useState<number>(0); // Track total questions for the role
  const [activeTab, setActiveTab] = useState<'basic' | 'advanced'>('basic');
  const basicSliderRef = useRef<Slider>(null);
  const advancedSliderRef = useRef<Slider>(null);

  // Get user role, questionBank access, and solved questions from Firestore
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const role = userDoc.data().role;
            const questionBank = userDoc.data().questionBank; // Get questionBank access level
            const solved = userDoc.data().solvedQuestions || []; // Get solved questions
            setUserRole(role);
            setQuestionBankAccess(questionBank);
            setSolvedQuestions(new Set(solved)); // Convert array to Set for faster lookups
          }
        } catch (error) {
          console.error("Error fetching user document:", error);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter questions based on user role and calculate total questions
  useEffect(() => {
    if (userRole) {
      // Check if userRole exists directly as a key
      if (userRole in questions) {
        const allQuestions = questions[userRole];

        // Separate basic and advanced questions
        const basic = allQuestions.filter(q => q.tags.toLowerCase() === 'basic');
        const advanced = allQuestions.filter(q => q.tags.toLowerCase() === 'advanced');

        setBasicQuestions(basic);
        setAdvancedQuestions(advanced);

        // Calculate total questions
        const total = basic.length + advanced.length;
        setTotalQuestions(total);

        // Update total questions in Firestore
        const user = auth.currentUser;
        if (user) {
          updateDoc(doc(db, "users", user.uid), {
            totalQuestions: total,
          }).catch((error) => {
            console.error("Error updating total questions:", error);
          });
        }
      } else {
        // Try with case-insensitive matching
        const matchingKey = Object.keys(questions).find(
          key => key.toLowerCase() === userRole.toLowerCase()
        );

        if (matchingKey) {
          const allQuestions = questions[matchingKey];

          // Separate basic and advanced questions
          const basic = allQuestions.filter(q => q.tags.toLowerCase() === 'basic');
          const advanced = allQuestions.filter(q => q.tags.toLowerCase() === 'advanced');

          setBasicQuestions(basic);
          setAdvancedQuestions(advanced);

          // Calculate total questions
          const total = basic.length + advanced.length;
          setTotalQuestions(total);

          // Update total questions in Firestore
          const user = auth.currentUser;
          if (user) {
            updateDoc(doc(db, "users", user.uid), {
              totalQuestions: total,
            }).catch((error) => {
              console.error("Error updating total questions:", error);
            });
          }
        } else {
          // Fallback: search through all questions by role field
          const allQuestions = Object.values(questions).flat();
          const basic = allQuestions.filter(q =>
            q.role && q.role.toLowerCase() === userRole.toLowerCase() && q.tags.toLowerCase() === 'basic'
          );
          const advanced = allQuestions.filter(q =>
            q.role && q.role.toLowerCase() === userRole.toLowerCase() && q.tags.toLowerCase() === 'advanced'
          );

          setBasicQuestions(basic);
          setAdvancedQuestions(advanced);

          // Calculate total questions
          const total = basic.length + advanced.length;
          setTotalQuestions(total);

          // Update total questions in Firestore
          const user = auth.currentUser;
          if (user) {
            setDoc(doc(db, "users", user.uid), {
              totalQuestions: total,
            }, { merge: true }).catch((error) => {
              console.error("Error updating total questions:", error);
            });
          }
        }
      }
    }
  }, [userRole, questionBankAccess]);

  // Function to toggle the visibility of the answer and mark the question as solved
  const toggleAnswer = async (questionId: string) => {
    setShowAnswer((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));

    // If the question is being shown for the first time, mark it as solved
    if (!showAnswer[questionId]) {
      const user = auth.currentUser;
      if (user) {
        try {
          // Add the question ID to the solvedQuestions Set
          const updatedSolvedQuestions = new Set(solvedQuestions).add(questionId);

          // Update Firestore
          await updateDoc(doc(db, "users", user.uid), {
            solvedQuestions: Array.from(updatedSolvedQuestions), // Convert Set to array
          });

          // Update local state
          setSolvedQuestions(updatedSolvedQuestions);
        } catch (error) {
          console.error("Error updating solved questions:", error);
        }
      }
    }
  };

  // Carousel Settings
  const carouselSettings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: false,
    afterChange: (current: number) => {
      // Update slide index independently for each carousel
      if (activeTab === 'basic') {
        setBasicSlideIndex(current + 1);
      } else {
        setAdvancedSlideIndex(current + 1);
      }
    },
  };

  // Calculate progress percentages
  const calculateProgress = (questionType: 'basic' | 'advanced') => {
    if (questionType === 'basic') {
      const solvedBasic = Array.from(solvedQuestions).filter(id => id.startsWith('basic-')).length;
      return basicQuestions.length > 0 ? Math.round((solvedBasic / basicQuestions.length) * 100) : 0;
    } else {
      const solvedAdvanced = Array.from(solvedQuestions).filter(id => id.startsWith('advanced-')).length;
      return advancedQuestions.length > 0 ? Math.round((solvedAdvanced / advancedQuestions.length) * 100) : 0;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-green-500 mx-auto"></div>
          <p className="mt-4 text-gray-300 font-medium">Loading your questions...</p>
        </div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="text-center max-w-md p-8 bg-gray-800 rounded-xl shadow-lg">
          <BookOpen size={48} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-100 mb-2">No Role Selected</h2>
          <p className="text-gray-400 mb-6">Please log in and select a role to view questions tailored to your career path.</p>
          <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors shadow-md">
            Return to Profile
          </button>
        </div>
      </div>
    );
  }

  if (basicQuestions.length === 0 && advancedQuestions.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="text-center max-w-md p-8 bg-gray-800 rounded-xl shadow-lg">
          <BookOpen size={48} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-100 mb-2">No Questions Available</h2>
          <p className="text-gray-400">We're currently building our question bank for {userRole}. Please check back soon!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          <h1 className="text-3xl font-bold text-center text-gray-100 mb-2">
            {userRole} <span className="text-green-500">Interview Questions</span>
          </h1>
          
          {/* Progress Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-4xl font-bold text-green-500 mb-1">{solvedQuestions.size}</div>
              <div className="text-gray-300 text-sm">Questions Solved</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-4xl font-bold text-green-500 mb-1">{calculateProgress('basic')}%</div>
              <div className="text-gray-300 text-sm">Basic Progress</div>
            </div>
            
            <div className="bg-gray-700 rounded-lg p-4 text-center">
              <div className="text-4xl font-bold text-green-500 mb-1">
                {questionBankAccess === 1 ? `${calculateProgress('advanced')}%` : <Lock size={24} className="inline text-gray-400" />}
              </div>
              <div className="text-gray-300 text-sm">Advanced Progress</div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex mb-6">
          <button
            onClick={() => setActiveTab('basic')}
            className={`flex-1 py-3 px-4 rounded-tl-lg rounded-tr-lg font-medium text-center transition-all ${
              activeTab === 'basic' 
                ? 'bg-gray-800 text-green-500 shadow-md border-b-2 border-green-500' 
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center justify-center">
              <BookOpen size={18} className="mr-2" />
              Basic Questions
            </div>
          </button>
          
          <button
            onClick={() => questionBankAccess === 1 ? setActiveTab('advanced') : null}
            className={`flex-1 py-3 px-4 rounded-tl-lg rounded-tr-lg font-medium text-center transition-all ${
              activeTab === 'advanced'
                ? 'bg-gray-800 text-green-500 shadow-md border-b-2 border-green-500' 
                : questionBankAccess === 1 
                  ? 'bg-gray-700 text-gray-400 hover:bg-gray-600'
                  : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            <div className="flex items-center justify-center">
              <Zap size={18} className="mr-2" />
              Advanced Questions
              {questionBankAccess === 0 && <Lock size={14} className="ml-2 text-gray-400" />}
            </div>
          </button>
        </div>
        
        {/* Question Cards */}
        <div className="bg-gray-800 rounded-xl shadow-md p-6 mb-8">
          {activeTab === 'basic' ? (
            <>
              <div className="mb-6 flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-100 flex items-center">
                  <BookOpen className="mr-2 text-green-500" size={24} />
                  Basic Questions
                </h2>
                <div className="text-sm font-medium text-gray-400">
                  {basicSlideIndex} of {basicQuestions.length}
                </div>
              </div>
              
              <div className="relative">
                <Slider {...carouselSettings} ref={basicSliderRef}>
                  {basicQuestions.map((q, index) => {
                    const questionId = `basic-${index}`;
                    const isSolved = solvedQuestions.has(questionId);
                    return (
                      <div key={questionId} className="px-2">
                        <div className="bg-gray-700 p-6 rounded-lg border border-gray-600 transition-all duration-300 min-h-64">
                          {isSolved && (
                            <div className="absolute top-2 right-2">
                              <CheckCircle className="text-green-500" size={20} />
                            </div>
                          )}
                          <h3 className="text-xl font-semibold mb-6 text-gray-100">{q.question}</h3>
                          
                          <button
                            onClick={() => toggleAnswer(questionId)}
                            className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-300 ${
                              showAnswer[questionId]
                                ? "bg-gray-600 text-gray-100 hover:bg-gray-500"
                                : "bg-green-600 text-white hover:bg-green-700"
                            }`}
                          >
                            {showAnswer[questionId] ? "Hide Answer" : "Show Answer"}
                          </button>
                          
                          {showAnswer[questionId] && (
                            <div className="mt-6 p-4 bg-gray-600 rounded-lg border border-gray-500 shadow-sm">
                              <p className="text-gray-200 whitespace-pre-line">{q.answer}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </Slider>
                
                <button
                  onClick={() => basicSliderRef.current?.slickPrev()}
                  className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-5 bg-gray-700 text-green-500 rounded-full p-2 shadow-md hover:bg-gray-600 transition-colors focus:outline-none"
                >
                  <ChevronLeft size={24} />
                </button>
                
                <button
                  onClick={() => basicSliderRef.current?.slickNext()}
                  className="absolute right-0 top-1/2 transform -translate-y-1/2 -mr-5 bg-gray-700 text-green-500 rounded-full p-2 shadow-md hover:bg-gray-600 transition-colors focus:outline-none"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </>
          ) : (
            questionBankAccess === 1 ? (
              <>
                <div className="mb-6 flex justify-between items-center">
                  <h2 className="text-2xl font-semibold text-gray-100 flex items-center">
                    <Zap className="mr-2 text-green-500" size={24} />
                    Advanced Questions
                  </h2>
                  <div className="text-sm font-medium text-gray-400">
                    {advancedSlideIndex} of {advancedQuestions.length}
                  </div>
                </div>
                
                <div className="relative">
                  <Slider {...carouselSettings} ref={advancedSliderRef}>
                    {advancedQuestions.map((q, index) => {
                      const questionId = `advanced-${index}`;
                      const isSolved = solvedQuestions.has(questionId);
                      return (
                        <div key={questionId} className="px-2">
                          <div className="bg-gray-700 p-6 rounded-lg border border-gray-600 transition-all duration-300 min-h-64">
                            {isSolved && (
                              <div className="absolute top-2 right-2">
                                <CheckCircle className="text-green-500" size={20} />
                              </div>
                            )}
                            <h3 className="text-xl font-semibold mb-6 text-gray-100">{q.question}</h3>
                            
                            <button
                              onClick={() => toggleAnswer(questionId)}
                              className={`w-full py-3 px-4 rounded-lg font-medium transition-colors duration-300 ${
                                showAnswer[questionId]
                                  ? "bg-gray-600 text-gray-100 hover:bg-gray-500"
                                  : "bg-green-600 text-white hover:bg-green-700"
                              }`}
                            >
                              {showAnswer[questionId] ? "Hide Answer" : "Show Answer"}
                            </button>
                            
                            {showAnswer[questionId] && (
                              <div className="mt-6 p-4 bg-gray-600 rounded-lg border border-gray-500 shadow-sm">
                                <p className="text-gray-200 whitespace-pre-line">{q.answer}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </Slider>
                  
                  <button
                    onClick={() => advancedSliderRef.current?.slickPrev()}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 -ml-5 bg-gray-700 text-green-500 rounded-full p-2 shadow-md hover:bg-gray-600 transition-colors focus:outline-none"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  
                  <button
                    onClick={() => advancedSliderRef.current?.slickNext()}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 -mr-5 bg-gray-700 text-green-500 rounded-full p-2 shadow-md hover:bg-gray-600 transition-colors focus:outline-none"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <Lock size={48} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-2xl font-bold text-gray-100 mb-3">Advanced Questions Locked</h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Upgrade to our premium plan to unlock {advancedQuestions.length} advanced questions tailored for {userRole} professionals.
                </p>
                <button className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-all shadow-md">
                  Upgrade Now
                </button>
              </div>
            )
          )}
        </div>
        
        {/* Progress Bar */}
        <div className="bg-gray-800 rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-100 mb-4 flex items-center">
            <Award className="mr-2 text-green-500" size={20} />
            Your Progress
          </h2>
          
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Basic Questions</span>
                <span className="text-sm font-medium text-green-500">{calculateProgress('basic')}%</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full transition-all duration-500" 
                  style={{ width: `${calculateProgress('basic')}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {Array.from(solvedQuestions).filter(id => id.startsWith('basic-')).length} of {basicQuestions.length} completed
              </p>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Advanced Questions</span>
                <span className="text-sm font-medium text-green-500">
                  {questionBankAccess === 1 ? `${calculateProgress('advanced')}%` : "Locked"}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className={`${questionBankAccess === 1 ? 'bg-green-500' : 'bg-gray-600'} h-2.5 rounded-full transition-all duration-500`} 
                  style={{ width: questionBankAccess === 1 ? `${calculateProgress('advanced')}%` : '5%' }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {questionBankAccess === 1 
                  ? `${Array.from(solvedQuestions).filter(id => id.startsWith('advanced-')).length} of ${advancedQuestions.length} completed` 
                  : "Upgrade to access advanced questions"
                }
              </p>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-gray-300">Overall Progress</span>
                <span className="text-sm font-medium text-green-500">
                  {questionBankAccess === 1 
                    ? `${Math.round((solvedQuestions.size / totalQuestions) * 100)}%` 
                    : `${Math.round((Array.from(solvedQuestions).filter(id => id.startsWith('basic-')).length / basicQuestions.length) * 100)}%`
                  }
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-green-500 h-2.5 rounded-full transition-all duration-500" 
                  style={{ 
                    width: questionBankAccess === 1 
                      ? `${Math.round((solvedQuestions.size / totalQuestions) * 100)}%` 
                      : `${Math.round((Array.from(solvedQuestions).filter(id => id.startsWith('basic-')).length / basicQuestions.length) * 100)}%` 
                  }}
                ></div>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {solvedQuestions.size} of {questionBankAccess === 1 ? totalQuestions : basicQuestions.length} total questions completed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPage;