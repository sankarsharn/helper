"use client";

import React, { useState, useEffect, useRef } from 'react';
import { BrainCircuit } from 'lucide-react';

// Import the JSON file
import questions from '@/behavorial/behavorial.json';

const Page = () => {
  const [selectedQuestions, setSelectedQuestions] = useState([]); // State to store selected questions
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0); // Track the current question index
  const [isDialogOpen, setIsDialogOpen] = useState(false); // Control dialog visibility
  const [userAnswer, setUserAnswer] = useState(''); // Store the user's answer
  const modalRef = useRef(null); // Ref for the modal content

  // Function to shuffle an array randomly
  const shuffleArray = (array) => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1)); // Random index
      [array[i], array[j]] = [array[j], array[i]]; // Swap elements
    }
    return array;
  };

  // Function to handle button click
  const handleStartInterview = () => {
    // Shuffle the questions and select the first 20
    const shuffledQuestions = shuffleArray([...questions]);
    const selected = shuffledQuestions.slice(0, 20);
    setSelectedQuestions(selected); // Update state with selected questions
    setIsDialogOpen(true); // Open the dialog
  };

  // Function to move to the next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < selectedQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1); // Move to the next question
      setUserAnswer(''); // Clear the answer input
    } else {
      setIsDialogOpen(false); // Close the dialog if all questions are answered
    }
  };

  // Function to close the modal when clicking outside
  const handleClickOutside = (event) => {
    if (modalRef.current && !modalRef.current.contains(event.target)) {
      setIsDialogOpen(false); // Close the modal
    }
  };

  // Add event listener for clicks outside the modal
  useEffect(() => {
    if (isDialogOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    // Cleanup the event listener
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDialogOpen]);

  return (
    <div className='min-h-screen bg-gray-100 flex flex-col items-center justify-center p-6 text-center'>
      <BrainCircuit size={80} className='text-black-600 mb-4' />
      <h1 className='text-3xl font-semibold text-gray-800'>Start Your Behavioral Interview</h1>
      <p className='text-gray-600 mt-2'>Our AI-powered system will guide you through the process.</p>

      {/* Button to start the interview */}
      <button
        onClick={handleStartInterview}
        className='mt-6 px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition cursor-pointer'
      >
        Begin Interview
      </button>

      {/* Dialog for displaying questions */}
      {isDialogOpen && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4'>
          <div
            ref={modalRef}
            className='bg-white rounded-lg shadow-lg w-full max-w-lg p-6'
          >
            <h2 className='text-2xl font-semibold text-gray-800 mb-4'>
              Question {currentQuestionIndex + 1} of {selectedQuestions.length}
            </h2>
            <p className='text-gray-700 mb-6'>{selectedQuestions[currentQuestionIndex].question}</p>

            {/* Textarea for user's answer */}
            <textarea
              value={userAnswer}
              onChange={(e) => setUserAnswer(e.target.value)}
              placeholder='Type your answer here...'
              className='w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-600 mb-6'
              rows={4}
            />

            {/* Button to move to the next question */}
            <button
              onClick={handleNextQuestion}
              className='w-full px-6 py-3 bg-gray-600 text-white rounded-lg shadow-md hover:bg-gray-700 transition cursor-pointer'
            >
              {currentQuestionIndex < selectedQuestions.length - 1 ? 'Next Question' : 'Finish'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Page;