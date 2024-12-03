'use client'

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader,  DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useStore } from '@/components/Providers/fetchAPI';
import { useUsernameStore } from "@/components/Providers/contextProvider"; // Zustand store



export default function UsernamePopup () {
  const [temp, setTemp] = useState('');
  const { username, setUsername } = useUsernameStore() as { username: string; setUsername: (username: string) => void };
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
      <DialogContent className="sm:max-w-[425px] text-card-foreground w-full max-w-full mx-2">
        <DialogHeader>
          <DialogDescription>
            Please enter your username to continue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 pb-4">
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
