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

  // This dialog now has exactly one job: switching handles from the sidebar's
  // "Viewing" block. It used to double as the front door — forced open whenever
  // `username === ""` and undismissable in that state — which made a modal with
  // no close control the first thing every new visitor met. `/` renders the
  // landing page in that case instead, so there is always something behind this
  // to return to, and it is always dismissable.
  return (
    <Dialog
      open={UsernamePopupisopen}
      onOpenChange={(open) => {
        if (!open) setUsernamePopupisopen(false);
      }}
    >
      <DialogContent
        dismissable
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