'use client'

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUsername } from "../components/Providers/contextProvider";
import { useStore } from '@/components/Providers/fetchAPI';

export default function UsernamePopup() {
  const [temp, setTemp] = useState('');
  const { username, setUsername } = useUsername();
  const { fetchData } = useStore() as {
    fetchData: (username: string) => void;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (temp.trim()) {
      setUsername(temp);
      fetchData(temp);
    }
  };

  return (
    <Dialog open={username === ""}>
      <DialogContent className="sm:max-w-[425px] text-card-foreground font-sans">
        <DialogHeader>
          <DialogTitle>Welcome!</DialogTitle>
          <DialogDescription>
            Please enter your username to continue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4 pb-2">
            <Input
              id="username"
              placeholder="Enter your username"
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
              className="border-input focus:border-ring"
              autoComplete="off"
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="mt-5 rounded bg-primary text-primary-foreground"
            >
              Set Username
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
