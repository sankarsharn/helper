"use client";

import React from "react";
import { InfiniteMovingCards } from "./ui/infinite-moving-cards";
import { ColourfulText } from "./ui/colourful-text";
import Link from "next/link";
import { Button } from "./ui/button";

// Define the type for testimonials
interface Testimonial {
  title: string;
  quote: string;
  name: string; // Required by InfiniteMovingCards
}

const testimonials: Testimonial[] = [
  {
    title: "Investment Banking (IB)",
    name: "Become and industry ready professional",
    quote:
      "Master financial modeling, valuation techniques, and deal structuring. Learn how M&A and IPO transactions are executed at top-tier investment banks.",
  },
  {
    title: "Private Equity (PE)",
    name: "Work for the top firms in town",
    quote:
      "Gain expertise in leveraged buyouts (LBOs), deal sourcing, and portfolio management strategies used by elite PE firms worldwide.",
  },
  {
    title: "Hedge Funds (HF)",
    name: "Handle the amounts in millions and billions",
    quote:
      "Understand hedge fund strategies, from long-short equity to global macro investing, and learn risk management techniques.",
  },
  {
    title: "Equity Research (ER)",
    name: "Master the art of stock picking",
    quote:
      "Develop skills in financial analysis, earnings modeling, and company valuations to generate insightful stock recommendations.",
  },
  {
    title: "Asset Management (AM)",
    name: "Manage the assests like no other",
    quote:
      "Explore portfolio management, asset allocation, and risk-adjusted investment strategies for institutional and retail investors.",
  },
  {
    title: "Corporate Finance (CF)",
    name: "Maximize shareholder value",
    quote:
      "Learn how companies manage capital structure, budgeting, and strategic financial decisions to maximize shareholder value.",
  },
];

const InfiniteScroll: React.FC = () => {
  return (
    <div className="h-[40rem] rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
      <h2 className="text-1.5xl md:text-3xl lg:text-5xl font-bold text-center text-black relative z-2 font-sans">
        Wide range of <ColourfulText text="roles covered" /> to choose from
      </h2>
      <br />
      <br />
      <InfiniteMovingCards items={testimonials} direction="right" speed="slow" />
      <br />
      <Link href="/login">
        <Button className="px-5 py-3 bg-black hover:bg-gray-900 text-white font-semibold text-lg rounded-lg shadow-md transition-all">
          Get Started Now
        </Button>
      </Link>
    </div>
  );
};

export default InfiniteScroll;
