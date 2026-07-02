import { CodeforcesUserCardProps } from "@/types/props";
import { CheckCircle2, Minus, Send, TrendingDown, TrendingUp, Users } from "lucide-react";

const RANK_COLORS: { [key: string]: string } = {
  newbie: "#808080",
  pupil: "#008000",
  specialist: "#04A89E",
  expert: "#0000FF",
  "candidate master": "#AB00AA",
  master: "#FF8C00",
  "international master": "#FF8C00",
  grandmaster: "#FF0000",
  "international grandmaster": "#FF0000",
  "legendary grandmaster": "#FF0000",
  tourist: "#FF0000",
};

function getRankColor(rank: string) {
  return RANK_COLORS[rank.toLowerCase()] || "#808080";
}

export function CodeforcesUserCard({
  userInfo,
  problemStats,
}: CodeforcesUserCardProps) {
  const rankColor = getRankColor(userInfo.rank || "");
  const contribution = userInfo.contribution ?? 0;
  const contributionColor =
    contribution > 0 ? "#3BA55C" : contribution < 0 ? "#FF4D4F" : undefined;
  const ContributionIcon =
    contribution > 0 ? TrendingUp : contribution < 0 ? TrendingDown : Minus;

  const stats = [
    { label: "Submissions", value: problemStats.total, icon: Send },
    {
      label: "Solved",
      value: problemStats.solved,
      icon: CheckCircle2,
      className: "text-3xl font-bold",
    },
    {
      label: "Contribution",
      value: contribution > 0 ? `+${contribution}` : contribution,
      icon: ContributionIcon,
      color: contributionColor,
    },
    { label: "Friends", value: userInfo.friendOfCount, icon: Users },
  ];

  return (
    <div className="h-full flex flex-col border-b border-neutral-600">
      {/* Terminal-style header */}
      <div className="px-4 py-1.5 border-b border-neutral-600 flex items-center gap-1.5 font-mono text-[11px] text-muted-foreground">
        <span className="text-green-500">$</span>
        <span>finger {userInfo.handle}</span>
        <span className="cursor-blink inline-block w-[6px] h-[13px] bg-muted-foreground/70 ml-0.5" />
      </div>

      <div className="flex-1 flex flex-col sm:flex-row items-stretch">
        {/* Left: Photo + Name */}
        <div className="flex flex-col border-b sm:border-b-0 sm:border-r border-neutral-600 w-full sm:w-[40%]">
          <div className="relative aspect-square sm:aspect-auto sm:flex-[3] overflow-hidden">
            {userInfo.avatar ? (
              <img
                src={userInfo.avatar}
                alt={userInfo.handle}
                className="absolute inset-0 object-cover object-center w-full h-full"
              />
            ) : (
              <div
                className="absolute inset-0 flex items-center justify-center font-mono text-4xl font-bold"
                style={{ backgroundColor: `${rankColor}1a`, color: rankColor }}
              >
                {userInfo.handle[0].toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1 px-4 py-3 border-t border-neutral-600 flex flex-col justify-end">
            <h2
              className="text-lg sm:text-xl font-bold font-mono truncate"
              style={{ color: rankColor }}
            >
              {userInfo.handle}
            </h2>
            <p className="text-xs text-muted-foreground font-mono mt-0.5 tabular-nums">
              Rating {userInfo.rating}{" "}
              <span className="opacity-60">· max {userInfo.maxRating}</span>
            </p>
            <span
              className="inline-block mt-1.5 px-2 py-0.5 border border-neutral-600 text-xs font-mono text-white w-fit"
              style={{ backgroundColor: rankColor }}
            >
              {userInfo.rank}
            </span>
          </div>
        </div>

        {/* Right: 2x2 stat grid */}
        <div className="flex-1 grid grid-cols-2 grid-rows-2">
          {stats.map(({ label, value, icon: Icon, className, color }, i) => (
            <div
              key={label}
              className={`flex flex-col justify-center gap-1 px-4 py-3 border-neutral-600 transition-colors hover:bg-white/[0.03] ${
                i % 2 === 0 ? "border-r" : ""
              } ${i < 2 ? "border-b" : ""}`}
            >
              <div className="flex items-center gap-1.5 text-[11px] font-mono text-muted-foreground uppercase tracking-wide">
                <Icon className="w-3 h-3" style={color ? { color } : undefined} />
                {label}
              </div>
              <div
                className={`font-mono tabular-nums ${className ?? "text-xl"}`}
                style={color ? { color } : undefined}
              >
                {value}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
