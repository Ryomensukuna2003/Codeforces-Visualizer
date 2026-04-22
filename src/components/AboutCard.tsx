import { CodeforcesUserCardProps } from "@/types/props";

export function CodeforcesUserCard({
  userInfo,
  problemStats,
}: CodeforcesUserCardProps) {
  const getRankColor = (rank: string) => {
    const rankColors: { [key: string]: string } = {
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
    return rankColors[rank.toLowerCase()] || "#808080";
  };

  return (
    <div className="h-full flex items-stretch border-b border-neutral-600">
      {/* Left: Photo + Name */}
      <div className="flex flex-col border-r border-neutral-600" style={{ width: "40%" }}>
        <div className="flex-[3] relative overflow-hidden">
          {userInfo.avatar ? (
            <img
              src={userInfo.avatar}
              alt={userInfo.handle}
              className="absolute inset-0 object-cover object-center w-full h-full"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center font-mono text-4xl text-muted-foreground">
              {userInfo.handle[0]}
            </div>
          )}
        </div>
        <div className="flex-1 px-4 py-3 border-t border-neutral-600 flex flex-col justify-end">
          <h2
            className="text-lg sm:text-xl font-bold font-mono truncate"
            style={{ color: getRankColor(userInfo.rank || "") }}
          >
            {userInfo.handle}
          </h2>
          <p className="text-xs text-muted-foreground font-mono mt-0.5">
            Rating: {userInfo.rating} [max: {userInfo.maxRating}]
          </p>
          <span
            className="inline-block mt-1 px-2 py-0.5 border border-neutral-600 text-xs font-mono text-white w-fit"
            style={{ backgroundColor: getRankColor(userInfo.rank || "") }}
          >
            {userInfo.rank}
          </span>
        </div>
      </div>

      {/* Right: 4 stat rows stacked evenly */}
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex flex-col justify-center items-end px-6 border-b border-neutral-600">
          <div className="text-xs font-mono text-muted-foreground">Total Submissions</div>
          <div className="text-2xl font-mono mt-1">{problemStats.total}</div>
        </div>
        <div className="flex-1 flex flex-col justify-center items-end px-6 border-b border-neutral-600">
          <div className="text-xs font-mono text-muted-foreground">Solved Problems</div>
          <div className="text-2xl font-mono mt-1">{problemStats.solved}</div>
        </div>
        <div className="flex-1 flex flex-col justify-center items-end px-6 border-b border-neutral-600">
          <div className="text-xs font-mono text-muted-foreground">Contribution</div>
          <div className="text-2xl font-mono mt-1">{userInfo.contribution}</div>
        </div>
        <div className="flex-1 flex flex-col justify-center items-end px-6">
          <div className="text-xs font-mono text-muted-foreground">Friends</div>
          <div className="text-2xl font-mono mt-1">{userInfo.friendOfCount}</div>
        </div>
      </div>
    </div>
  );
}
