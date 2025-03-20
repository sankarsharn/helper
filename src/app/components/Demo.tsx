"use client";
import React, { useEffect, useState } from "react";
import { BackgroundGradient } from "@/app/components/ui/background-gradient";
import {
  TextRevealCard,
  TextRevealCardTitle,
  TextRevealCardDescription,
} from "./ui/text-reveal";

const Demo: React.FC = () => {
  const [displayText, setDisplayText] = useState("");
  const fullText = "Welcome to the website";
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < fullText.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + fullText[index]);
        setIndex((prev) => prev + 1);
      }, 150); // Adjust the speed of typing here

      return () => clearTimeout(timeout);
    } else {
      // Reset the text and index after a delay
      const timeout = setTimeout(() => {
        setDisplayText("");
        setIndex(0);
      }, 1000); // Delay before restarting

      return () => clearTimeout(timeout);
    }
  }, [index, fullText]);

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-[#0E0E10] p-8">
      {/* Inline CSS for blinking animation */}
      <style>
        {`
          @keyframes blink {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0;
            }
          }
          .blinking-cursor {
            animation: blink 1s infinite;
          }
        `}
      </style>

      {/* Blinking text animation */}
      <div className="text-4xl font-bold text-white mb-20"> {/* Increased margin-bottom */}
        <span className="blinking-text">{displayText}</span>
        <span className="blinking-cursor">|</span>
      </div>

      {/* Flex container for TextRevealCard and video box */}
      <div className="flex items-center gap-8 w-full max-w-6xl">
        {/* TextRevealCard on the left */}
        <TextRevealCard
          text="Kickstart your career"
          revealText="Pick your domain"
        >
          <TextRevealCardTitle>
            Discover your future in finance.
          </TextRevealCardTitle>
          <TextRevealCardDescription>
            Explore career paths in investment banking, private equity, and consulting.
          </TextRevealCardDescription>
        </TextRevealCard>

        {/* Video box with gradient border on the right */}
        <BackgroundGradient containerClassName="flex-1 rounded-[30px]">
          <div className="bg-black w-full h-[280px] p-2 rounded-2xl">
            <video
              autoPlay
              loop
              playsInline
              className="rounded-2xl overflow-hidden shadow-[0_0_30px] shadow-gray-700 w-full h-full"
            >
              <source src="/demo2.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </BackgroundGradient>
      </div>
    </div>
  );
};

export default Demo;