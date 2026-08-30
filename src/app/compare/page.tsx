"use client";

import { useEffect, useMemo, useState } from "react";
import { useUsernameStore } from "@/components/Providers/contextProvider";
import { ArrowRightLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FetchUserData, CompareRatingChange, h2hScore } from "@/lib/utils";
import { ParseData } from "@/lib/ParseData";
import { RankBandChart } from "@/components/dossier/RankBandChart";
import { FigCaption, Notice, PageHeader } from "@/components/dossier/primitives";
import { group, longDate } from "@/lib/dossier";
import { cn } from "@/lib/utils";

type Side = ReturnType<typeof ParseData> & {
  acRate: number;
  avgProblemRating: number;
};

/** AC rate and average accepted problem rating — not in ParseData, cheap here. */
function extraStats(allSubmissionsData: any) {
  const subs: any[] = allSubmissionsData?.result ?? [];
  const accepted = subs.filter((s) => s.verdict === "OK");
  const rated = accepted.filter((s) => s.problem?.rating);
  return {
    acRate: subs.length ? Math.round((accepted.length / subs.length) * 100) : 0,
    avgProblemRating: rated.length
      ? Math.round(rated.reduce((sum, s) => sum + s.problem.rating, 0) / rated.length)
      : 0,
  };
}

export default function EnhancedUserComparison() {
  const { toast } = useToast();
  const { username } = useUsernameStore() as { username: string };

  const [user1, setUser1] = useState("");
  const [user2, setUser2] = useState("");
  const [you, setYou] = useState<Side | null>(null);
  const [rival, setRival] = useState<Side | null>(null);
  const [curve, setCurve] = useState<any[] | null>(null);
  const [isfetching, setisfetching] = useState(false);
  const [isfetched, setisfetched] = useState(false);

  // The sidebar's "add a rival" lands here — start from the handle already in view.
  useEffect(() => {
    setUser1((prev) => prev || username);
  }, [username]);

  const compareUsers = async () => {
    setYou(null);
    setRival(null);
    setCurve(null);
    setisfetched(false);

    if (!user1.trim() || !user2.trim()) {
      toast({
        variant: "destructive",
        title: "Set both handles",
        description: "Please provide both usernames for comparison.",
      });
      return;
    }
    if (user1 === user2) {
      toast({
        variant: "default",
        title: "Same handle twice",
        description: "Usernames are the same — please provide two different handles.",
      });
      return;
    }

    setisfetching(true);
    try {
      const a = await FetchUserData(user1);
      const b = await FetchUserData(user2);

      if (typeof a.userInfoData === "string" || typeof b.userInfoData === "string") {
        toast({
          variant: "destructive",
          title:
            typeof a.userInfoData === "string" ? a.userInfoData : (b.userInfoData as string),
          description: "Please check the spelling of the handles.",
        });
        return;
      }

      const parsedA = ParseData(a.userInfoData, a.allSubmissionsData, a.allRating, user1);
      const parsedB = ParseData(b.userInfoData, b.allSubmissionsData, b.allRating, user2);
      if (!parsedA || !parsedB) {
        toast({
          variant: "destructive",
          title: "Not enough data",
          description: "Codeforces returned an incomplete profile for one of these handles.",
        });
        return;
      }

      setYou({ ...parsedA, ...extraStats(a.allSubmissionsData) });
      setRival({ ...parsedB, ...extraStats(b.allSubmissionsData) });
      setisfetched(true);
    } catch (error) {
      // FetchUserData uses bare axios, so any rejection used to escape as an
      // unhandled promise and the only visible effect was the button changing
      // back from "Fetching…". Same split as the overview: a bad handle is the
      // user's to fix, an outage is not.
      const badHandle = (error as any)?.response?.status === 400;
      void fetch("/api/metric", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "compare:failed" }),
      }).catch(() => {});
      toast({
        variant: "destructive",
        title: badHandle ? "No such handle" : "Could not reach Codeforces",
        description: badHandle
          ? "Codeforces has no user by one of those names. Check the spelling."
          : "Nothing wrong with these handles — try again in a minute.",
      });
    } finally {
      setisfetching(false);
    }
  };

  useEffect(() => {
    if (you?.RatingChangeData && rival?.RatingChangeData) {
      const merged = CompareRatingChange(
        you.RatingChangeData as any,
        rival.RatingChangeData as any,
        user1,
        user2
      );
      setCurve(
        merged.map((row: any) => ({
          label: longDate(new Date(row.date).getTime() / 1000),
          [user1]: row[user1] || null,
          [user2]: row[user2] || null,
        }))
      );
    }
  }, [you, rival, user1, user2]);

  const score = useMemo(() => {
    if (!you || !rival) return null;
    return h2hScore([
      { label: "Rating", left: you.rating ?? 0, right: rival.rating ?? 0 },
      { label: "Peak rating", left: you.maxRating ?? 0, right: rival.maxRating ?? 0 },
      {
        label: "Problems solved",
        left: you.problemSolved,
        right: rival.problemSolved,
        fmt: group,
      },
      { label: "Contests", left: you.contestsParticipated, right: rival.contestsParticipated },
      { label: "AC rate", left: you.acRate, right: rival.acRate, fmt: (n) => `${n}%` },
      { label: "Avg problem rating", left: you.avgProblemRating, right: rival.avgProblemRating },
    ]);
  }, [you, rival]);

  const gap = you && rival ? Math.abs((you.rating ?? 0) - (rival.rating ?? 0)) : 0;

  const handleInput =
    "w-full bg-transparent font-display text-stat font-bold text-foreground placeholder:text-faint";

  return (
    <>
      <PageHeader
        eyebrow="Head to head"
        title="Compare"
        actions={
          <button
            type="button"
            onClick={compareUsers}
            disabled={isfetching}
            className="bg-foreground px-3.5 py-2.5 text-meta text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {isfetching ? "Fetching…" : "Compare"}
          </button>
        }
      />

      {/* Handles -------------------------------------------------------- */}
      <div className="flex flex-col items-stretch border-b border-rule sm:flex-row">
        <div className="flex-1 border-b border-hair px-5 py-4 sm:border-b-0 sm:border-r">
          <label
            htmlFor="user1"
            className="mb-2.5 block text-label font-medium text-faint"
          >
            You
          </label>
          <div className="flex items-baseline gap-3">
            <input
              id="user1"
              value={user1}
              placeholder="your handle"
              onChange={(e) => setUser1(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && compareUsers()}
              className={handleInput}
            />
            {you?.rank ? (
              <span className="shrink-0 bg-foreground px-[9px] py-[3px] text-label uppercase text-background">
                {you.rank}
              </span>
            ) : null}
          </div>
        </div>

        <div className="flex w-full shrink-0 items-center justify-center border-hair py-3 sm:w-[190px] sm:border-r sm:py-0">
          <ArrowRightLeft className="h-5 w-5 text-faint" />
        </div>

        <div className="flex-1 border-t border-hair px-5 py-4 sm:border-t-0">
          <label
            htmlFor="user2"
            className="mb-2.5 block text-label font-medium text-faint"
          >
            Rival
          </label>
          <div className="flex items-baseline gap-3">
            <input
              id="user2"
              value={user2}
              placeholder="their handle"
              onChange={(e) => setUser2(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && compareUsers()}
              className={handleInput}
            />
            {rival?.rank ? (
              <span className="shrink-0 border border-rule px-[9px] py-[3px] text-label uppercase text-muted-foreground">
                {rival.rank}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      {!isfetched || !score ? (
        <Notice>Enter two handles to score the head-to-head.</Notice>
      ) : (
        <>
          <div className="flex flex-wrap items-center justify-center gap-3 border-b border-rule bg-inset py-4">
            <span className="text-body text-muted-foreground">Standing:</span>
            <span className="text-body text-foreground">
              <b>{score.ahead}</b> ahead
            </span>
            <span className="text-faint">·</span>
            <span className="text-body text-red-500">
              <b>{score.behind}</b> behind
            </span>
            <span className="text-faint">·</span>
            <span className="text-body tabular-nums text-muted-foreground">gap {gap} rating</span>
          </div>

          {/* Mirrored metric bars — winner is foreground, loser is muted, and
              that single contrast is the whole readout. */}
          {score.metrics.map((m) => (
            <div
              key={m.label}
              className="flex flex-col items-stretch border-b border-hair transition-colors hover:bg-rowhover sm:flex-row"
            >
              <div className="flex flex-1 items-center justify-end gap-4 px-5 py-3">
                <div className="hidden h-2 max-w-[280px] flex-1 justify-end bg-track sm:flex">
                  <div
                    className={cn("h-full", m.leftWins ? "bg-foreground" : "bg-muted-foreground")}
                    style={{ width: `${m.leftW}%` }}
                  />
                </div>
                <span
                  className={cn(
                    "w-[76px] text-right font-display text-lead font-bold tabular-nums",
                    m.leftWins ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {m.leftLabel}
                </span>
              </div>

              <div className="flex shrink-0 items-center justify-center border-hair px-4 py-1 text-label text-muted-foreground sm:w-[190px] sm:border-x sm:py-0">
                {m.label}
              </div>

              <div className="flex flex-1 items-center gap-4 px-5 py-3">
                <span
                  className={cn(
                    "w-[76px] font-display text-lead font-bold tabular-nums",
                    !m.leftWins ? "text-foreground" : "text-muted-foreground"
                  )}
                >
                  {m.rightLabel}
                </span>
                <div className="hidden h-2 max-w-[280px] flex-1 bg-track sm:block">
                  <div
                    className={cn("h-full", !m.leftWins ? "bg-foreground" : "bg-muted-foreground")}
                    style={{ width: `${m.rightW}%` }}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Closes on a section rule like every other page bottom. */}
          <div className="border-b border-rule">
            <FigCaption
              aside={
                <span className="flex gap-[18px]">
                  <span>
                    <span className="mr-1.5 inline-block h-0.5 w-3.5 bg-foreground align-middle" />
                    {user1}
                  </span>
                  <span>
                    <span className="mr-1.5 inline-block h-0.5 w-3.5 bg-muted-foreground align-middle" />
                    {user2}
                  </span>
                </span>
              }
            >
              Both rating curves, overlaid
            </FigCaption>
            <RankBandChart
              data={curve ?? []}
              series={[
                { key: user1, label: user1 },
                { key: user2, label: user2, dashed: true },
              ]}
              height={236}
            />
          </div>
        </>
      )}
    </>
  );
}
