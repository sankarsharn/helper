
"use client";
 
import React, { useEffect, useState } from "react";
import { InfiniteMovingCards } from "./ui/infinite-moving-cards";
import { ColourfulText } from "./ui/colourful-text";
import Link from "next/link";
import { Button } from "./ui/button";

const testimonials = [
    {
      quote:
        "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity, it was the season of Light, it was the season of Darkness, it was the spring of hope, it was the winter of despair.",
      name: "Charles Dickens",
      title: "A Tale of Two Cities",
    },
    {
      quote:
        "To be, or not to be, that is the question: Whether 'tis nobler in the mind to suffer The slings and arrows of outrageous fortune, Or to take Arms against a Sea of troubles, And by opposing end them: to die, to sleep.",
      name: "William Shakespeare",
      title: "Hamlet",
    },
    {
      quote: "All that we see or seem is but a dream within a dream.",
      name: "Edgar Allan Poe",
      title: "A Dream Within a Dream",
    },
    {
      quote:
        "It is a truth universally acknowledged, that a single man in possession of a good fortune, must be in want of a wife.",
      name: "Jane Austen",
      title: "Pride and Prejudice",
    },
    {
      quote:
        "Call me Ishmael. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would sail about a little and see the watery part of the world.",
      name: "Herman Melville",
      title: "Moby-Dick",
    },
  ];
const InfiniteScroll = () => {
  return (
    <div className="h-[40rem] rounded-md flex flex-col antialiased bg-white dark:bg-black dark:bg-grid-white/[0.05] items-center justify-center relative overflow-hidden">
      <h2 className="text-1.5xl md:text-3xl lg:text-5xl font-bold text-center text-black relative z-2 font-sans">
        Wide range of <ColourfulText text="roles covered" /> to choose from 
      </h2>
      <br />
      <br />
      <InfiniteMovingCards
        items={testimonials}
        direction="right"
        speed="slow"
      />
      <br />
       <Link href="/login">
          <Button className="px-5 py-3 bg-black hover:bg-gray-900 text-white font-semibold text-lg rounded-lg shadow-md transition-all">
            Get Started Now
          </Button>
        </Link>
      
    </div>
  )
}

export default InfiniteScroll