"use client";

import { useEffect, useRef } from 'react';
import type { User } from '@/types';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';

interface WinnerPopupProps {
  user: User | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function WinnerPopup({ user, isOpen, onOpenChange }: WinnerPopupProps) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isOpen && !isFirstRender.current) {
      // Confetti burst from the center of the screen
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.4 },
        angle: 90,
        startVelocity: 40,
        ticks: 300,
        gravity: 1,
        colors: ['#FFD700', '#FFC700', '#FFB700', '#FFA500']
      });
    }
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, [isOpen]);
  
  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-200 via-orange-300 to-red-400 dark:from-yellow-900/80 dark:via-orange-950/60 dark:to-red-950/40 text-center p-8">
        <DialogHeader className="items-center">
            <Trophy className="h-20 w-20 text-yellow-400 drop-shadow-lg" />
            <DialogTitle className="text-3xl font-bold tracking-tighter text-primary mt-4">
                New Leader!
            </DialogTitle>
        </DialogHeader>
        <div className="py-4">
            <p className="text-xl">
                Congratulations to <span className="font-bold text-accent-foreground">{user.name}</span>
            </p>
            <p className="text-muted-foreground mt-1">for taking the #1 spot with {user.points.toLocaleString()} points!</p>
        </div>
        <Button onClick={() => onOpenChange(false)} className="mt-4">
            Awesome!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
