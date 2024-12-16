import { create } from "zustand";
import { devtools } from "zustand/middleware";
import axios from "axios";

const handleSaveUsername = async (username: string) => {
  try {
    const response = await axios.post("/api/user", { username });
  } catch (error) {
    console.error("Failed to save username:", error);
  }
};

export const useStore = create(
  devtools((set) => ({
    userInfoData: null,
    allSubmissionsData: null,
    allRating: null,
    contestData: null,
    isLoading: false,
    fetchData: async (username: string) => {
      set({ isLoading: true });
      try {
        await handleSaveUsername(username);

        const [userInfoData, allSubmissionsData, allRating, contestData, UpcomingContestData, codforcesContestData] = await Promise.all([
          axios.get(`https://codeforces.com/api/user.info?handles=${username}`).then((res) => res.data),
          axios.get(`https://codeforces.com/api/user.status?handle=${username}&from=1`).then((res) => res.data),
          axios.get(`https://codeforces.com/api/user.rating?handle=${username}`).then((res) => res.data),
          axios.get("https://codeforces.com/api/contest.list?gym=false").then((res) => res.data),
          axios.get(`https://clist.by/api/v4/contest/?format=json&upcoming=true&username=Casper&api_key=${process.env.NEXT_PUBLIC_CLIST_API_KEY}&limit=100&offset=100`).then((res) => res.data),
          axios.get('https://codeforces.com/api/contest.list?gym=false').then((res) => res.data)
        ]);
        // Update the store state
        set({ userInfoData, allSubmissionsData, allRating, contestData, UpcomingContestData, codforcesContestData, isLoading: false });
      } catch (error) {
        console.error("Failed to fetch data:", error);
        set({ isLoading: false, userInfoData: "Username is not Valid" });
      }
    },
  }))
);