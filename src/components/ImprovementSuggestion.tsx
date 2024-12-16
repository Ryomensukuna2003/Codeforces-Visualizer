"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useUsernameStore } from "@/components/Providers/contextProvider"; // Zustand store
import MarkdownFade from "./ui/markdownFade";
import { ImprovementSuggestionProps } from "@/app/types";


export function ImprovementSuggestion({
  userData,
  problemStats,
}: ImprovementSuggestionProps) {
  const { username } = useUsernameStore() as { username: string };
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
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
    <div className="relative w-full h-full rounded-xl  py-6 ">
      <Card className=" border-none px-6 ">
        <CardHeader>
          <CardTitle>Hey, wanna know what you're missing? 😉</CardTitle>
          <p className="text-base text-muted-foreground">
            Get Personalized advice with Gemini
          </p>
        </CardHeader>
        <CardContent>
          {suggestion ? (
            <div className="">
              <MarkdownFade
                content={suggestion}
                className="text-base text-muted-foreground mb-2"
              />
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
    </div>
  );
}