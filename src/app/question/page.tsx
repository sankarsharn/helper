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
import { CheckCircle } from 'lucide-react'; // Import the green tick icon

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
    afterChange: (current: number) => {
      // Update slide index independently for each carousel
      if (basicSliderRef.current) {
        setBasicSlideIndex(current + 1);
      }
      if (advancedSliderRef.current) {
        setAdvancedSlideIndex(current + 1);
      }
    },
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!userRole) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <p className="text-xl text-gray-900">Please log in and select a role to view questions.</p>
      </div>
    );
  }

  if (basicQuestions.length === 0 && advancedQuestions.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-white">
        <p className="text-xl text-gray-900">No questions available for your role yet.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-900">Questions for {userRole}</h1>
      <p className="text-lg text-gray-700 mb-8 text-center">
        Total Questions: {totalQuestions} (Solved: {solvedQuestions.size}, Basic: {basicQuestions.length}, Advanced: {advancedQuestions.length})
      </p>

      {/* Basic Questions Carousel */}
      <div className="mb-12 flex flex-col items-center">
        <h2 className="text-2xl font-semibold mb-4 text-gray-900">Basic Questions</h2>
        <div className="w-full max-w-2xl"> {/* Limit carousel width */}
          <Slider {...carouselSettings} ref={basicSliderRef}>
            {basicQuestions.map((q, index) => {
              const questionId = `basic-${index}`;
              const isSolved = solvedQuestions.has(questionId); // Check if the question is solved
              return (
                <div
                  key={questionId}
                  className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 mx-2 relative"
                  style={{ width: '300px', height: '300px', margin: '0 auto' }} // Squarish dimensions and centered
                >
                  {/* Green tick for solved questions */}
                  {isSolved && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle className="text-green-500" size={24} />
                    </div>
                  )}
                  <h3 className="text-xl font-semibold mb-4 text-gray-900">{q.question}</h3>
                  <button
                    onClick={() => toggleAnswer(questionId)}
                    className="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-300 cursor-pointer"
                  >
                    {showAnswer[questionId] ? "Hide Answer" : "Show Answer"}
                  </button>
                  {showAnswer[questionId] && (
                    <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                      <p className="text-gray-700">{q.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </Slider>
          <div className="flex justify-center items-center mt-4 space-x-4">
            <button
              onClick={() => basicSliderRef.current?.slickPrev()}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-300 cursor-pointer"
            >
              &larr; Previous
            </button>
            <span className="text-gray-900">
              {basicSlideIndex} / {basicQuestions.length}
            </span>
            <button
              onClick={() => basicSliderRef.current?.slickNext()}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-300 cursor-pointer"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      </div>

      {/* Advanced Questions Carousel */}
      {questionBankAccess === 1 && (
        <div className="mb-12 flex flex-col items-center">
          <h2 className="text-2xl font-semibold mb-4 text-gray-900">Advanced Questions</h2>
          <div className="w-full max-w-2xl"> {/* Limit carousel width */}
            <Slider {...carouselSettings} ref={advancedSliderRef}>
              {advancedQuestions.map((q, index) => {
                const questionId = `advanced-${index}`;
                const isSolved = solvedQuestions.has(questionId); // Check if the question is solved
                return (
                  <div
                    key={questionId}
                    className="bg-gray-50 p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border border-gray-200 mx-2 relative"
                    style={{ width: '300px', height: '300px', margin: '0 auto' }} // Squarish dimensions and centered
                  >
                    {/* Green tick for solved questions */}
                    {isSolved && (
                      <div className="absolute top-2 right-2">
                        <CheckCircle className="text-green-500" size={24} />
                      </div>
                    )}
                    <h3 className="text-xl font-semibold mb-4 text-gray-900">{q.question}</h3>
                    <button
                      onClick={() => toggleAnswer(questionId)}
                      className="w-full py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-300 cursor-pointer"
                    >
                      {showAnswer[questionId] ? "Hide Answer" : "Show Answer"}
                    </button>
                    {showAnswer[questionId] && (
                      <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                        <p className="text-gray-700">{q.answer}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </Slider>
            <div className="flex justify-center items-center mt-4 space-x-4">
              <button
                onClick={() => advancedSliderRef.current?.slickPrev()}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-300 cursor-pointer"
              >
                &larr; Previous
              </button>
              <span className="text-gray-900">
                {advancedSlideIndex} / {advancedQuestions.length}
              </span>
              <button
                onClick={() => advancedSliderRef.current?.slickNext()}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors duration-300 cursor-pointer"
              >
                Next &rarr;
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upgrade Message for Free Plan Users */}
      {questionBankAccess === 0 && (
        <div className="mt-8 p-6 bg-gray-50 rounded-lg text-center border border-gray-200">
          <p className="text-lg text-gray-700">
            To access <strong className="text-gray-900">advanced</strong> questions, please upgrade to a paid plan.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionPage;