"use client";
import React, { useState, useEffect } from "react";
import Extra from "../Hamburger";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { ModeToggle } from "@/components/ui/toggle";
import { useUsernameStore } from "@/components/Providers/contextProvider"; // Zustand store
import { useStore } from "@/components/Providers/fetchAPI";

export const NavBar = () => {
  const [isWideScreen, setIsWideScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const { username, setUsername } = useUsernameStore() as unknown as {
    username: string;
    setUsername: (username: string) => void;
  };

  // Importing raw fetched data
  const { fetchData } = useStore() as unknown as {
    fetchData: (username: string) => void;
  };

  return (
    <nav className="sticky w-full top-0 z-50 bg-white dark:bg-black border-b border-neutral-600">
      <div className="flex justify-between items-center h-20">
        {/* Left section */}
        <div className="flex items-center">
          <Extra />
          <div className="h-20 border-l border-neutral-600 flex items-center">
            <Link href="/">
              <h1 className="text1 text-3xl justify-content-center p-6 border-r border-neutral-600">
                CF Stats
                <span className="span1 w-full justify-center text-center">
                  CF Stats
                </span>
              </h1>
            </Link>
          </div>
        </div>

        {/* Right section */}
        {isWideScreen && (
          <div className="flex items-center">
            <div className="flex h-20">
              <Input
                type="text"
                placeholder="Enter Codeforces username"
                className="h-20 text-center rounded-none border-neutral-600 focus-visible:ring-0 focus-visible:ring-offset-0 border-0 border-l hover:border-b-4"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              ></Input>

              <Button
                className="w-auto h-auto rounded-none border-neutral-600 bg-black text-white hover:bg-neutral-600 dark:bg-white dark:text-black dark:hover:bg-neutral-200 border-0 border-l"
                onClick={() => fetchData(username)}
              >
                <Search className="h-auto w-auto m-2 p-2" />
              </Button>
            </div>
            <ModeToggle className="h-20 w-20 rounded-none border-0 border-l border-neutral-600" />
          </div>
        )}
      </div>
    </nav>
  );
};