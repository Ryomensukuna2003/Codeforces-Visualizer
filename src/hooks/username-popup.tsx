'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useUsername } from "../components/Providers/contextProvider";

export default function UsernamePopup() {
  const [temp, setTemp] = useState('')
  const { username, setUsername } = useUsername();
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    setIsOpen(true)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setUsername(temp);
    if (temp.trim()) {
      setIsOpen(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground font-sans">
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
            />
          </div>
          <DialogFooter>
            <Button type="submit" className="mt-5 rounded bg-primary text-primary-foreground">
              Set Username
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
