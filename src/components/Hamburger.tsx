"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ui/toggle";
import { useUsernameStore } from "@/components/Providers/contextProvider"; // Zustand store
import { AnimatePresence, motion } from 'framer-motion';
import { Menu, X, Github, Linkedin } from 'lucide-react';


const Extra = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { username } = useUsernameStore() as unknown as {
      username: string;
    };
  
    const panelVariants = {
      closed: {
        x: '-100%',
        transition: {
          type: 'tween',
          duration: 0.5,
          ease: [0, 0, 0.2, 1] // Ease-out
        }
      },
      open: {
        x: 0,
        transition: {
          type: 'tween',
          duration: 0.5,
          ease: [0.4, 0, 1, 1] // Ease-in
        }
      }
    };
  
    const togglePanel = () => {
      setIsOpen(!isOpen);
    };
  
    return (
      <>
        {/* Trigger Button */}
        <Button
          variant="ghost"
          className="p-0 h-20 w-20 rounded-none hover:bg-neutral-100 dark:hover:bg-neutral-600 border-neutral-600"
          onClick={togglePanel}
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </Button>
  
        {/* Video Panel */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial="closed"
              animate="open"
              exit="closed"
              variants={panelVariants}
              className="fixed top-0 left-0 w-full h-full bg-background z-50" // Use global variable for background
            >
              <div className="relative h-full">
                <nav className="sticky w-full top-0 z-50 bg-background border-b border-neutral-600">
                  <div className="flex justify-between items-center h-20">
                    {/* Left section */}
                    <div className="flex items-center">
                      <Button
                        className="p-0 h-20 w-20 rounded-none border-neutral-600"
                        onClick={togglePanel}
                      >
                        <X className="h-6 w-6" />
                      </Button>
                      <div className="h-20 border-l border-neutral-600 flex items-center">
                        <h1 className="text1 text-3xl justify-content-center p-6 border-r border-neutral-600">
                          CF Stats
                          <span className="span1 w-full justify-center text-center">CF Stats</span>
                        </h1>
                      </div>
                    </div>
                    {/* Right section */}
                    <div className="flex items-center">
                      <ModeToggle className="h-20 w-20 rounded-none border-0 border-l border-neutral-600" />
                    </div>
                  </div>
                </nav>
  
                {/* Content Container */}
                <div className="mx-[10%] border-x border-neutral-600">
                  <div className="w-full flex-row  md:flex-row justify-center items-center text-center">
  
                    <div className="flex h-[20vh]">
                      <div className="flex-1 border-r border-neutral-600"></div>
                      <div className="flex-1 border-r border-neutral-600"></div>
                      <div className="flex-1 h-full flex flex-col">
                        <div className="flex-1 border-b border-neutral-600 flex items-center justify-center"></div>
                        <div className="flex-1 flex items-center justify-center text-3xl">[ {username} ]</div>
                      </div>
                    </div>
  
                    <Link href="/compare" className="w-full text-xl md:w-1/3 md:text-5xl border-b">
                      <h1 className=" text1 justify-content-center py-10 border-y  border-neutral-600">
                        Compare ID's
                        <span className="span1">Compare ID's</span>
                      </h1>
                    </Link>
                    <Link href="/problems" className="w-full text-xl md:w-1/3 md:text-5xl border-b">
                      <h1 className=" text1 justify-content-center py-10 border-b  border-neutral-600">
                        View All Problems
                        <span className="span1">View All Problems</span>
                      </h1>
                    </Link>
                    <Link href="/rating_change" className="w-full text-xl md:w-1/3 md:text-5xl border-b">
                      <h1 className=" text1 py-10 border-b border-neutral-600">
                        Rating Changes
                        <span className="span1">Rating Changes</span>
                      </h1>
                    </Link>
                    <Link href="/submissions" className="w-full text-xl  md:w-1/3 md:text-5xl">
                      <h1 className=" text1 py-10 border-b  border-neutral-600">
                        View All Submissions
                        <span className="span1">View All Submissions</span>
                      </h1>
                    </Link>
                  </div>
  
                  <div className="flex border-b justify-center items-center border-neutral-600">
                    <a
                      href="https://github.com/ryomensukuna2003"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex-1 flex justify-center items-center text-3xl p-8 border-r border-neutral-600 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold relative
          transition-all duration-100 ease-out overflow-hidden
          hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_hsl(var(--card))]"
                    >
                      Github
                      <Github className="ml-4" />
                    </a>
                    <a
                      href="https://www.linkedin.com/in/shivanshu-/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex-1 flex justify-center items-center border-neutral-600 text-3xl p-8 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold relative
          transition-all duration-100 ease-out overflow-hidden
          hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[10px_10px_0_0_hsl(var(--card))]"
                    >
                      Linkedin
                      <Linkedin className="ml-4" />
                    </a>
                  </div>
  
  
                  <div className="flex h-[20vh]">
                    <div className="flex-1 border-r border-neutral-600"></div>
                    <div className="flex-1 border-r border-neutral-600"></div>
                    <div className="flex-1 border-r border-neutral-600"></div>
                    <div className="flex-1 "></div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  }
  
  
  
  export default Extra ;