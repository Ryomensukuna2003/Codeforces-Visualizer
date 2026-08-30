'use client'

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from '@/components/Providers/fetchAPI';
import { FloatingLabelInput } from '@/components/ui/floating-label-input';
import { useUsernameStore } from "@/components/Providers/contextProvider"; // Zustand store

export default function UsernamePopup() {
  const [temp, setTemp] = useState('');
  const { username, setUsername, UsernamePopupisopen, setUsernamePopupisopen } = useUsernameStore() as { username: string; setUsername: (username: string) => void; UsernamePopupisopen: boolean; setUsernamePopupisopen: (isOpen: boolean) => void; };
  const { fetchData } = useStore() as {
    fetchData: (username: string) => void;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (temp.trim()) {
      setUsername(temp);
      fetchData(temp);
      setUsernamePopupisopen(false);
    }
  };

  // The sidebar's "Viewing" block reopens this to switch handles, so the dialog
  // follows the store flag rather than `username === ""`. Dismissable only once
  // a handle is set — otherwise there is nothing behind it to look at.
  return (
    <Dialog
      open={UsernamePopupisopen || username === ""}
      onOpenChange={(open) => {
        if (!open && username !== "") setUsernamePopupisopen(false);
      }}
    >
      <DialogContent
        // Nothing behind it to look at until a handle is set, so there is no
        // close control to offer.
        dismissable={username !== ""}
        className="sm:max-w-[425px] text-card-foreground mx-2"
        aria-describedby="username-dialog-description"
      >
        <DialogHeader>
          {/* Radix needs a title for the dialog to have an accessible name; the
              app calls this a handle everywhere else, so this does too. */}
          <DialogTitle className="text-body font-medium text-foreground">
            Whose dossier?
          </DialogTitle>
          <DialogDescription id="username-dialog-description" className="text-meta text-muted-foreground">
            Enter a Codeforces handle to continue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="relative grid gap-10 pb-4 ">
            <FloatingLabelInput
              id="floating-demo"
              label="Handle"
              className="block caret-primary username-dialog-input"
              style={{ caretShape: "block" } as React.CSSProperties}
              type="text"
              value={temp}
              onChange={(e) => setTemp(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button
              type="submit"
              className="mt-5 bg-primary text-primary-foreground"
            >
              View dossier
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}