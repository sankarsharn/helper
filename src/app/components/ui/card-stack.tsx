"use client";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

let interval: any;

type Card = {
  id: number;
  name: string;
  designation: string;
  content: React.ReactNode;
};

export const CardStack = ({
  items,
  offset,
  scaleFactor,
}: {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
}) => {
  const CARD_OFFSET = offset || 10;
  const SCALE_FACTOR = scaleFactor || 0.06;
  const [cards, setCards] = useState<Card[]>(items);

  useEffect(() => {
    startFlipping();

    return () => clearInterval(interval);
  }, []);

  const startFlipping = () => {
    interval = setInterval(() => {
      setCards((prevCards: Card[]) => {
        const newArray = [...prevCards]; // create a copy of the array
        newArray.unshift(newArray.pop()!); // move the last element to the front
        return newArray;
      });
    }, 5000);
  };

  return (
    <div className="relative h-[30rem] w-full max-w-4xl"> {/* Wider container */}
      {cards.map((card, index) => {
        return (
          <motion.div
            key={card.id}
            className="absolute bg-neutral-900 h-[28rem] w-full max-w-4xl rounded-3xl p-8 shadow-xl border border-neutral-700 shadow-white/[0.05] flex flex-col justify-between"
            style={{
              transformOrigin: "top center",
            }}
            animate={{
              top: index * -CARD_OFFSET,
              scale: 1 - index * SCALE_FACTOR, // decrease scale for cards that are behind
              zIndex: cards.length - index, // decrease z-index for the cards that are behind
            }}
          >
            <div className="font-normal text-neutral-200 text-lg">
              {card.content}
            </div>
            <div>
              <p className="text-neutral-300 font-medium text-xl">
                {card.name}
              </p>
              <p className="text-neutral-400 font-normal text-lg">
                {card.designation}
              </p>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};