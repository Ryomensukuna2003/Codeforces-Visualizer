"use client";
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/ui/toggle";

import React from 'react'

const NavBar_sm = ({Title}: {Title: string}) => {
  return (
    <div className="flex items-center  h-20 sticky top-0 z-50 bg-background/80 backdrop-blur-md ">
        <h1 className="text-3xl flex-1 font-bold">{Title}</h1>
        <Link className="" href="/">
          <Button
            className="h-20 border-0 border-l bg-card px-6 border-neutral-600"
            variant="outline"
          >
            Back to Dashboard
          </Button>
        </Link>
        <ModeToggle className="h-20 w-20 rounded-none bg-card border-0 border-x border-neutral-600 " />
      </div>
  )
}

export default NavBar_sm