"use client";
import { CardStack } from "@/app/components/ui/card-stack";
import { cn } from "@/lib/utils";

export const Highlight = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={cn(
        "font-bold bg-emerald-700/[0.2] text-emerald-500 px-1 py-0.5", // Dark mode highlight
        className
      )}
    >
      {children}
    </span>
  );
};

const CARDS = [
  {
    id: 0,
    name: "John Doe",
    designation: "Placed at Google",
    content: (
      <p>
        This platform helped me <Highlight>ace my interviews</Highlight> and land
        a job at Google. The mock interviews were incredibly realistic and
        helpful!
      </p>
    ),
  },
  {
    id: 1,
    name: "Jane Smith",
    designation: "Placed at Microsoft",
    content: (
      <p>
        I loved the <Highlight>question bank</Highlight> and the detailed
        feedback after each mock interview. It made me feel confident and
        prepared for my Microsoft interview.
      </p>
    ),
  },
  {
    id: 2,
    name: "Alice Johnson",
    designation: "Placed at Amazon",
    content: (
      <p>
        The <Highlight>AI-powered mock interviews</Highlight> were a game-changer
        for me. They helped me identify my weak areas and improve significantly.
        Thanks to this platform, I got placed at Amazon!
      </p>
    ),
  },
  {
    id: 3,
    name: "Bob Williams",
    designation: "Placed at Facebook",
    content: (
      <p>
        The <Highlight>progress tracking</Highlight> feature was amazing. It kept
        me motivated and on track throughout my preparation. I highly recommend
        this platform to anyone preparing for tech interviews.
      </p>
    ),
  },
  {
    id: 4,
    name: "Charlie Brown",
    designation: "Placed at Apple",
    content: (
      <p>
        The <Highlight>behavioral interview prep</Highlight> was spot on. It
        helped me articulate my experiences and skills effectively during my
        Apple interview. I couldn't have done it without this platform!
      </p>
    ),
  },
];

export default function CardStackDemo() {
  return (
    <div className="h-[50rem] flex items-center justify-center w-full bg-neutral-950"> {/* Dark mode background */}
      <CardStack items={CARDS} />
    </div>
  );
}