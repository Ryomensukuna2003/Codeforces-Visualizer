"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useUsername } from "./Providers/contextProvider";

interface ImprovementSuggestionProps {
  userData: {
    handle: string;
    rating?: number;
    rank?: string;
    ratingFreq: RatingFrequency[] | null;
  };

  problemStats: {
    total: number;
    solved: number;
    attempted: number;
  };
}

interface RatingFrequency {
  question_rating: number;
  Questions: number;
}

export function ImprovementSuggestion({
  userData,
  problemStats,
}: ImprovementSuggestionProps) {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { username } = useUsername();

  useEffect(() => {
    setSuggestion(null);
  }, [username]);

  const getSuggestion = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/getsuggestion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userData, problemStats }),
      });
      const data = await response.json();
      setSuggestion(data.suggestion);
    } catch (error) {
      console.error("Error fetching suggestion:", error);
      setSuggestion(
        "Sorry, we couldn't generate a suggestion at this time. Please try again later."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Hey wanna know what you're missing 😉 </CardTitle>
        <p className="text-base text-muted-foreground">
          Get Personalized advice with gemini
        </p>
      </CardHeader>
      <CardContent>
        <ReactMarkdown></ReactMarkdown>
        {suggestion ? (
          <div className="space-y-4">
            <p className="text-base text-muted-foreground">
              <p className="text-base">
                <ReactMarkdown>{suggestion}</ReactMarkdown>
              </p>
            </p>
            <Button onClick={() => setSuggestion(null)}>
              Get Another Suggestion
            </Button>
          </div>
        ) : (
          <Button onClick={getSuggestion} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Suggestion...
              </>
            ) : (
              "Get Personalized Suggestion"
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
