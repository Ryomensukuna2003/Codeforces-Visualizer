import { useState, useEffect } from 'react'
import { Card } from "@/components/ui/card"
import { Blockquote, BlockquoteAuthor } from './ui/blockquote'

const quotes = [
  {
    quote: "The only way to learn a new programming language is by writing programs in it.",
    author: "Dennis Ritchie",
  },
  {
    quote: "Sometimes it's better to leave something alone, to pause, and that's very true of programming.",
    author: "Joyce Wheeler",
  },
  {
    quote: "Premature optimization is the root of all evil.",
    author: "Donald Knuth",
  },
  {
    quote: "The best error message is the one that never shows up.",
    author: "Thomas Fuchs",
  },
  {
    quote: "The most important property of a program is whether it accomplishes the intention of its user.",
    author: "C.A.R. Hoare",
  },
  {
    quote: "The best thing about a boolean is even if you are wrong, you are only off by a bit.",
    author: "Anonymous",
  },
  {
    quote: "The function of good software is to make the complex appear to be simple.",
    author: "Grady Booch",
  },
  {
    quote: "Programming is like writing a book... except if you miss a single comma on page 126, the whole thing makes no sense.",
    author: "Anonymous",
  },
  {
    quote: "If debugging is the process of removing bugs, then programming must be the process of putting them in.",
    author: "Edsger Dijkstra",
  },
  {
    quote: "Walking on water and developing software from a specification are easy if both are frozen.",
    author: "Edward V. Berard",
  },
  {
    quote: "Real programmers count from 0. Real bugs start at -1.",
    author: "Anonymous",
  },
  {
    quote: "A user interface is like a joke. If you have to explain it, it's not that good.",
    author: "Anonymous",
  },
  {
    quote: "99 little bugs in the code, 99 little bugs. Take one down, patch it around, 117 bugs in the code.",
    author: "Anonymous",
  },
  {
    quote: "Competitive programming teaches you two things: patience and how to swear silently.",
    author: "Anonymous",
  },
  {
    quote: "In competitive programming, the code doesn't have to be pretty; it just has to work within 1 second.",
    author: "Anonymous",
  },
  {
    quote: "There's no feeling like solving a problem at 4 AM after 6 hours of debugging. And then realizing it's the wrong solution.",
    author: "Anonymous",
  },
  {
    quote: "Brute force is a perfectly valid strategy—until it’s not.",
    author: "Anonymous",
  },
  {
    quote: "In competitive programming, 'Runtime Error' is just the universe telling you to think harder.",
    author: "Anonymous",
  },
  {
    quote: "Dynamic programming: the art of turning exponential pain into linear disappointment.",
    author: "Anonymous",
  },
  {
    quote: "You know you're a competitive programmer when you dream in recursion.",
    author: "Anonymous",
  },
  {
    quote: "Competitive programming is like chess, but your pieces are arrays, and your moves are edge cases.",
    author: "Anonymous",
  },
  {
    quote: "Time limit exceeded? It's not the algorithm's fault. It's the computer's fault for being slow.",
    author: "Anonymous",
  },
  {
    quote: "If competitive programming has taught me one thing, it's that there's always someone faster. And younger.",
    author: "Anonymous",
  },
  {
    quote: "When in doubt, write 'long long int'.",
    author: "Every Competitive Programmer Ever",
  },
];



export function CompetitiveProgrammingQuotes() {
  const [currentQuote, setCurrentQuote] = useState<{ quote: string; author: string } | null>(null)

  useEffect(() => {
    const randomQuote = quotes[Math.floor(Math.random() * quotes.length)]
    setCurrentQuote(randomQuote)
  }, [])

  return (
    <Card className="bg-card absolute inset-0 m-auto dark:bg-card dark:border-card-border backdrop-blur-sm border-border" style={{ width: 'fit-content', height: 'fit-content' }}>
      <Blockquote>
        {currentQuote?.quote}
        <BlockquoteAuthor>{currentQuote?.author}</BlockquoteAuthor>
      </Blockquote>
    </Card>
  )
}