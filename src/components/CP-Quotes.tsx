import { useState, useEffect } from 'react'
import { Label } from './dossier/primitives'

const quotes = [
  {
    quote: "The only way to learn a new programming language is by writing programs in it."
  },
  {
    quote: "Sometimes it's better to leave something alone, to pause, and that's very true of programming."
  },
  {
    quote: "Premature optimization is the root of all evil."
  },
  {
    quote: "The best error message is the one that never shows up."
  },
  {
    quote: "The most important property of a program is whether it accomplishes the intention of its user."
  },
  {
    quote: "The best thing about a boolean is even if you are wrong, you are only off by a bit."
  },
  {
    quote: "The function of good software is to make the complex appear to be simple."
  },
  {
    quote: "Programming is like writing a book... except if you miss a single comma on page 126, the whole thing makes no sense."
  },
  {
    quote: "If debugging is the process of removing bugs, then programming must be the process of putting them in."
  },
  {
    quote: "Walking on water and developing software from a specification are easy if both are frozen."
  },
  {
    quote: "Real programmers count from 0. Real bugs start at -1."
  },
  {
    quote: "A user interface is like a joke. If you have to explain it, it's not that good."
  },
  {
    quote: "99 little bugs in the code, 99 little bugs. Take one down, patch it around, 117 bugs in the code."
  },
  {
    quote: "Competitive programming teaches you two things: patience and how to swear silently."
  },
  {
    quote: "In competitive programming, the code doesn't have to be pretty; it just has to work within 1 second."
  },
  {
    quote: "There's no feeling like solving a problem at 4 AM after 6 hours of debugging. And then realizing it's the wrong solution."
  },
  {
    quote: "Brute force is a perfectly valid strategy—until it's not."
  },
  {
    quote: "In competitive programming, 'Runtime Error' is just the universe telling you to think harder."
  },
  {
    quote: "Dynamic programming: the art of turning exponential pain into linear disappointment."
  },
  {
    quote: "You know you're a competitive programmer when you dream in recursion."
  },
  {
    quote: "Competitive programming is like chess, but your pieces are arrays, and your moves are edge cases."
  },
  {
    quote: "If competitive programming has taught me one thing, it's that there's always someone faster. And younger."
  },
  {
    quote: "When in doubt, write 'long long int'."
  },
];



/**
 * Shown in the verdict slot while the dossier is being assembled — set in the
 * page's own type, not a floating card. The first render is deterministic so
 * the server and the client agree; the effect swaps in a random one after.
 */
export function CompetitiveProgrammingQuotes() {
  const [quote, setQuote] = useState(quotes[0].quote)

  useEffect(() => {
    setQuote(quotes[Math.floor(Math.random() * quotes.length)].quote)
  }, [])

  return (
    <>
      <Label caps className="mb-3 block">
        Reading the file
      </Label>
      <p className="max-w-[68ch] text-lead text-muted-foreground [text-wrap:pretty]">
        {quote}
      </p>
    </>
  )
}
