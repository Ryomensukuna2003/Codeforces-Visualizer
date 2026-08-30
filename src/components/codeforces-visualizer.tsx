"use client";

import axios from "axios";
import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUsernameStore } from "@/components/Providers/contextProvider";
import { useStore } from "./Providers/fetchAPI";
import Skeleton_Fragment from "./skeleton-components";
import { CompetitiveProgrammingQuotes } from "./CP-Quotes";
import { ImprovementSuggestion } from "./ImprovementSuggestion";
import { RankBandChart } from "./dossier/RankBandChart";
import { StandParameters } from "./dossier/StandParameters";
import { FigCaption, Label, StatStrip } from "./dossier/primitives";
import { buildStandRadarData } from "@/lib/stand-radar-metrics";
import { group, shortDate, signed } from "@/lib/dossier";
import { buildVerdict, cn, deltaLast30d, submissionSummary } from "@/lib/utils";

import {
  UserInfo,
  Rating,
  ProblemRatingDistribution,
  TagStatistics as TagStatisticsType,
} from "@/app/types";

import {
  processRatings,
  processBarGraphData,
  processSubmissions,
  processRatingGraph,
  processRatingFreqGraph,
  getUpcomingContests,
} from "../lib/utils";

/** "updated 2 min ago" in the masthead eyebrow. */
function sinceLabel(fetchedAt: number | null, now: number | null): string {
  if (!fetchedAt || now === null) return "live";
  const mins = Math.floor((now - fetchedAt) / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function CodeforcesVisualizerComponent() {
  const { username, setAttempted, UsernamePopupisopen } =
    useUsernameStore() as unknown as {
      username: string;
      setAttempted: (attempted: string[]) => void;
      UsernamePopupisopen: boolean;
    };
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [unratedUser, setUnratedUser] = useState<boolean>(false);
  const { toast } = useToast();
  const [questions, setquestions] = useState(0);
  const [total_Solved, setTotalSolved] = useState(0);
  const [LineGraphData, setLineGraphData] = useState<Rating[]>([]);
  const [barGraphData, setBarGraphData] = useState<ProblemRatingDistribution[]>([]);
  const [upcomingContests, setUpcomingContests] = useState<any[] | null>(null);
  const [contestsParticipated, setcontestsParticipated] = useState<number>(0);
  const [bestRank, setbestRank] = useState<number>(Number.MAX_SAFE_INTEGER);
  const [worstRank, setworstRank] = useState<number>(0);
  const [averageRatingChange, setaverageRatingChange] = useState<number>(0);
  const [bestRatingChange, setbestRatingChange] = useState<number>(0);
  const [worstRatingChange, setworstRatingChange] = useState<number>(0);
  const [TotalAcceptedProblems, setTotalAcceptedProblems] = useState<number>(0);
  const [averageAcceptedProblemRating, setaverageAcceptedProblemRating] = useState<number>(0);
  const [TagStatistics, setTagStatistics] = useState<TagStatisticsType[]>([]);

  const {
    userInfoData,
    allSubmissionsData,
    allRating,
    contestData,
    fetchedAt,
    isLoading,
    fetchData,
  } = useStore() as unknown as {
    userInfoData: any;
    allSubmissionsData: any;
    allRating: any;
    contestData: any;
    fetchedAt: number | null;
    isLoading: boolean;
    fetchData: (username: string, force?: boolean) => void;
  };

  const [isloading, setisloading] = useState(true);
  // A new fetch means the dossier on screen belongs to someone else. Without
  // this, switching handles left the old numbers up until the new ones landed.
  useEffect(() => {
    if (isLoading) setisloading(true);
  }, [isLoading]);
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    // The store parks a string here when the fetch failed. Which string decides
    // whether we blame the handle or own the outage.
    if (typeof userInfoData === "string") {
      setisloading(false);
      toast(
        userInfoData === "Username is not Valid"
          ? {
              variant: "destructive",
              title: "No such handle",
              description: "Codeforces has no user by that name. Check the spelling.",
            }
          : {
              variant: "destructive",
              title: "Could not reach Codeforces",
              description: "Nothing wrong with your handle — try the refresh in a minute.",
            }
      );
      return;
    }

    // Only parse a genuinely complete payload — the old guard fell through to
    // parseData() whenever `result` was missing, which threw and stranded the
    // page on the skeleton.
    const profile = userInfoData?.result?.[0];
    if (!profile || !allSubmissionsData?.result || !allRating?.result || !contestData?.result) {
      return;
    }

    if (profile.rating === undefined) {
      // No toast: the full-page unrated state below says this already, and said
      // it in a different voice and a different casing seconds apart.
      setUnratedUser(true);
      setisloading(false);
      return;
    }

    setUnratedUser(false);
    parseData();
  }, [userInfoData, allSubmissionsData, allRating, contestData]);

  const parseData = async () => {
    try {
      const uniqueProblems = new Set<string>();
      const ratingFreqMap = new Map<number, number>();
      let ratingArr: Rating[] = [];
      let ratingFreq: ProblemRatingDistribution[] = [];

      setTotalAcceptedProblems(0);

      setcontestsParticipated(allRating.result.length);
      processRatings(
        allRating,
        setbestRatingChange,
        setworstRatingChange,
        setbestRank,
        setworstRank,
        setaverageRatingChange
      );
      processSubmissions(
        allSubmissionsData,
        setTagStatistics,
        setTotalAcceptedProblems,
        uniqueProblems,
        ratingFreqMap
      );
      processRatingGraph(allRating, ratingArr);
      processRatingFreqGraph(ratingFreqMap, ratingFreq);
      // Fed the array just built, not the `barGraphData` state, which is still
      // the previous handle's distribution at this point — or empty on the first
      // parse, which made the average 0 for the whole session.
      processBarGraphData(ratingFreq, setaverageAcceptedProblemRating);

      const nowSeconds = Math.floor(Date.now() / 1000);
      setTotalSolved(uniqueProblems.size);
      setAttempted(Array.from(uniqueProblems));
      setBarGraphData(ratingFreq);
      setLineGraphData(ratingArr);
      setUserInfo(userInfoData.result[0]);
      setquestions(allSubmissionsData.result.length);
      setUpcomingContests(getUpcomingContests(contestData, nowSeconds));
      setisloading(false);
    } catch (error) {
      console.error("Error parsing Codeforces data:", error);
      setisloading(false);
    }
  };

  const userData = {
    handle: userInfo?.handle || "USER",
    rating: userInfo?.rating ?? 0,
    maxRating: userInfo?.maxRating ?? 0,
    rank: userInfo?.rank ?? "unranked",
    maxRank: userInfo?.maxRank ?? "unranked",
    contribution: userInfo?.contribution ?? 0,
    friendOfCount: userInfo?.friendOfCount ?? 0,
    lastOnlineTimeSeconds: userInfo?.lastOnlineTimeSeconds ?? 0,
    registrationTimeSeconds: userInfo?.registrationTimeSeconds ?? 0,
    avatar: userInfo?.titlePhoto,
    problemRatingDistribution: barGraphData,
    contestsParticipated,
    bestRank,
    worstRank,
    topSolvedTags: TagStatistics,
    recentContests: contestsParticipated,
    averageRatingChange,
    bestRatingChange,
    worstRatingChange,
    totalAcceptedProblems: TotalAcceptedProblems,
    averageAcceptedProblemRating,
  };

  const problemStats = { total: questions, solved: total_Solved, attempted: total_Solved };

  const summary = useMemo(() => submissionSummary(allSubmissionsData), [allSubmissionsData]);
  const delta30 = useMemo(() => deltaLast30d(allRating), [allRating]);
  const verdict = useMemo(
    () => buildVerdict(allSubmissionsData, allRating, userData.rating),
    [allSubmissionsData, allRating, userData.rating]
  );
  const curve = useMemo(
    () =>
      (allRating?.result ?? [])
        .slice()
        .sort((a: any, b: any) => a.ratingUpdateTimeSeconds - b.ratingUpdateTimeSeconds)
        .map((r: any) => ({
          label: shortDate(r.ratingUpdateTimeSeconds),
          rating: r.newRating,
        })),
    [allRating]
  );
  const stand = useMemo(
    () =>
      buildStandRadarData({
        submissions: allSubmissionsData?.result ?? [],
        tagStatistics: TagStatistics,
        contestsParticipated,
        averageAcceptedProblemRating,
        userRating: userData.rating,
        registrationTimeSeconds: userData.registrationTimeSeconds,
        ratingHistory: LineGraphData,
      }),
    [
      allSubmissionsData,
      TagStatistics,
      contestsParticipated,
      averageAcceptedProblemRating,
      userData.rating,
      userData.registrationTimeSeconds,
      LineGraphData,
    ]
  );

  // Record one snapshot per handle per day, from the numbers actually on screen
  // rather than from mid-parse locals — what gets stored is then exactly what
  // the user was shown. Fire-and-forget: the endpoint upserts, and analytics
  // must never be able to fail the page.
  const snapshotSent = React.useRef<string | null>(null);
  useEffect(() => {
    if (isloading || unratedUser || !userInfo?.handle) return;
    if (snapshotSent.current === userInfo.handle) return;
    snapshotSent.current = userInfo.handle;

    const byMetric = Object.fromEntries(stand.map((r) => [r.metric, r.value]));
    axios
      .post("/api/snapshot", {
        handle: userInfo.handle,
        rating: userInfo.rating ?? null,
        maxRating: userInfo.maxRating ?? null,
        rank: userInfo.rank ?? null,
        maxRank: userInfo.maxRank ?? null,
        solved: total_Solved,
        submissions: questions,
        acRate: summary.acRate,
        avgSolvedRating: averageAcceptedProblemRating,
        contests: contestsParticipated,
        bestRank,
        worstRank,
        avgRatingChange: averageRatingChange,
        bestRatingChange,
        worstRatingChange,
        accuracy: byMetric.Accuracy,
        range: byMetric.Range,
        power: byMetric.Power,
        speed: byMetric.Speed,
        durability: byMetric.Durability,
        potential: byMetric.Potential ?? null,
        tagCounts: Object.fromEntries(TagStatistics.map((t) => [t.tag, t.count])),
      })
      .catch(() => {});
  }, [
    isloading,
    unratedUser,
    userInfo,
    total_Solved,
    questions,
    summary.acRate,
    averageAcceptedProblemRating,
    contestsParticipated,
    bestRank,
    worstRank,
    averageRatingChange,
    bestRatingChange,
    worstRatingChange,
    stand,
    TagStatistics,
  ]);

  if (isloading) {
    // One live region for the whole load, not one per skeleton bar, and no
    // blurred scrim: the skeleton is already the shape of the page, so covering
    // it with a frosted overlay was hiding the only thing it had to say.
    return (
      <div role="status" aria-busy="true" aria-live="polite">
        <span className="sr-only">
          Reading {username ? `${username}'s` : "the"} Codeforces history…
        </span>
        <Skeleton_Fragment
          verdict={UsernamePopupisopen ? undefined : <CompetitiveProgrammingQuotes />}
        />
      </div>
    );
  }

  // A failed fetch parks a string in the store. Without this the page fell
  // through and rendered a complete dossier for a placeholder handle called
  // "USER" — rank "unranked", 0 / peak 0, and a verdict in the red block.
  if (typeof userInfoData === "string") {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-2 px-5 text-center">
        <h1 className="font-display text-title font-bold text-foreground">
          Could not load this dossier
        </h1>
        <p className="max-w-[46ch] text-body text-muted-foreground">
          {userInfoData === "Username is not Valid"
            ? "Codeforces has no user by that name. Check the spelling, then try another handle from the sidebar."
            : "Codeforces did not answer. Nothing is wrong with your handle — try again in a minute."}
        </p>
      </div>
    );
  }

  if (unratedUser) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center gap-2 px-6">
        <h1 className="font-display text-title font-bold text-foreground">User is unrated</h1>
        <p className="text-body text-muted-foreground">
          This handle hasn&apos;t finished a rated contest yet.
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Masthead ------------------------------------------------------- */}
      <div className="border-b border-rule px-5 pb-7 pt-8">
        {/* Responses are cached for five minutes, so the timestamp doubles as
            the way out of stale data. */}
        <button
          type="button"
          onClick={() => fetchData(username, true)}
          disabled={isLoading}
          title="Refetch from Codeforces"
          className="mb-4 block text-left transition-colors hover:text-muted-foreground disabled:opacity-50"
        >
          <Label caps>
            Codeforces dossier · updated {sinceLabel(fetchedAt, now)}
            <span className="ml-2 underline underline-offset-2">
              {isLoading ? "refreshing…" : "↻ refresh"}
            </span>
          </Label>
        </button>
        <h1 className="break-words font-display text-title font-bold text-foreground sm:text-display">
          {userData.handle}
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
          <span className="bg-foreground px-2.5 py-1 text-label font-medium uppercase text-background">
            {userData.rank}
          </span>
          <span className="font-mono text-meta tabular-nums text-muted-foreground">
            {userData.rating}
            <span className="text-faint"> / peak {userData.maxRating}</span>
          </span>
          <span className="font-mono text-meta tabular-nums text-foreground">
            {delta30 === null ? "—" : signed(delta30)}{" "}
            <span className="font-sans text-faint">last 30d</span>
          </span>
        </div>

        {/* The verdict — the page's one loud element. The sentence is set in the
            text face; the damning figures switch to the display cut at the same
            size, so the numbers speak in a different voice from the prose. */}
        <div className="mt-7 border-l-2 border-red-500 bg-background py-5 pl-6 pr-5">
          <Label caps className="mb-3 block text-red-500">
            The verdict
          </Label>
          <p className="max-w-[68ch] text-lead text-foreground [text-wrap:pretty]">
            {verdict.map((part, i) =>
              part.bold ? (
                <span
                  key={i}
                  className={cn(
                    "font-display font-bold tabular-nums",
                    part.accent ? "text-red-500" : "text-foreground"
                  )}
                >
                  {part.text}
                </span>
              ) : (
                <React.Fragment key={i}>{part.text}</React.Fragment>
              )
            )}
          </p>
        </div>
      </div>

      {/* Stat strip ----------------------------------------------------- */}
      <StatStrip
        items={[
          { label: "Solved", value: group(problemStats.solved) },
          { label: "Submissions", value: group(problemStats.total) },
          { label: "AC rate", value: `${summary.acRate}%` },
          {
            label: "Best rank",
            value: bestRank === Number.MAX_SAFE_INTEGER ? "—" : group(bestRank),
          },
          { label: "Avg change", value: signed(Math.round(averageRatingChange)) },
        ]}
      />

      {/* Rating curve + stand meters ------------------------------------ */}
      <div className="flex flex-col border-b border-rule xl:flex-row xl:items-stretch">
        {/* The chart fills whatever height the Stand panel beside it settles on,
            so the two columns end on the same rule instead of leaving a dead
            band under a fixed-height plot. */}
        <div className="flex min-w-0 flex-1 flex-col xl:border-r xl:border-rule">
          <FigCaption aside={`${contestsParticipated} rated contests`}>
            Rating against the rank ceiling
          </FigCaption>
          <RankBandChart
            data={curve}
            series={[{ key: "rating", label: "rating" }]}
            className="min-h-[280px] flex-1"
          />
        </div>
        <div className="shrink-0 border-t border-rule xl:w-[392px] xl:border-t-0">
          <FigCaption>Stand parameters</FigCaption>
          <StandParameters data={stand} contests={upcomingContests ?? []} />
        </div>
      </div>

      {/* Coach ---------------------------------------------------------- */}
      <ImprovementSuggestion userData={userData} problemStats={problemStats} />
    </>
  );
}
