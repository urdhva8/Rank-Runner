
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
import { Award, Medal, Trophy } from 'lucide-react';
import confetti from 'canvas-confetti';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from './ui/avatar';

interface PodiumPopupProps {
  users: User[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

const rankIcons = [
    { icon: Trophy, color: "text-yellow-400" },
    { icon: Medal, color: "text-slate-400" },
    { icon: Award, color: "text-orange-500" },
];

export function PodiumPopup({ users, isOpen, onOpenChange }: PodiumPopupProps) {
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isOpen && !isFirstRender.current) {
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.4 },
        angle: 90,
        startVelocity: 40,
        ticks: 300,
        gravity: 1,
        colors: ['#FFD700', '#FFC700', '#FFB700', '#FFA500', '#FFFFFF', '#C0C0C0']
      });
    }
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, [isOpen]);
  
  if (users.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-yellow-200 via-orange-300 to-red-400 dark:from-yellow-900/80 dark:via-orange-950/60 dark:to-red-950/40 text-center p-8">
        <DialogHeader className="items-center">
            <Trophy className="h-16 w-16 text-yellow-400 drop-shadow-lg" />
            <DialogTitle className="text-3xl font-bold tracking-tighter text-primary mt-4">
                Top Champions!
            </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
            {users.map((user, index) => {
                const RankIcon = rankIcons[index]?.icon || Award;
                const iconColor = rankIcons[index]?.color || "text-muted-foreground";
                return (
                    <div key={user.id} className="flex items-center gap-4 p-3 bg-background/50 rounded-lg">
                        <RankIcon className={cn("h-8 w-8", iconColor)} />
                        <Avatar className='h-12 w-12'>
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-left flex-1">
                            <p className="font-bold text-lg text-accent-foreground">{user.name}</p>
                            <p className="text-muted-foreground">{user.points.toLocaleString()} points</p>
                        </div>
                        <div className="font-bold text-2xl text-primary">#{index + 1}</div>
                    </div>
                )
            })}
        </div>
        <Button onClick={() => onOpenChange(false)} className="mt-4">
            Awesome!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
