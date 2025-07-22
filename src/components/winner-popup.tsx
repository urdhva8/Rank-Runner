
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
  lastClaim: { user: User; pointsAdded: number } | null;
}

const rankIcons = [
    { icon: Trophy, color: "text-yellow-400" },
    { icon: Medal, color: "text-slate-400" },
    { icon: Award, color: "text-orange-500" },
];

export function PodiumPopup({ users, isOpen, onOpenChange, lastClaim }: PodiumPopupProps) {
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
      <DialogContent className="sm:max-w-md bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-700 via-gray-900 to-black text-center p-8 border-0 dark:from-orange-300 dark:via-orange-500 dark:to-orange-600">
        <DialogHeader className="items-center">
            <Trophy className="h-16 w-16 text-yellow-300 drop-shadow-lg" />
            <DialogTitle className="text-3xl font-bold tracking-tighter text-white dark:text-orange-950 mt-4">
                Top Champions!
            </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
            {users.map((user, index) => {
                const RankIcon = rankIcons[index]?.icon || Award;
                const iconColor = rankIcons[index]?.color || "text-muted-foreground";
                const isLastClaimer = lastClaim?.user.id === user.id;

                return (
                    <div key={user.id} className="flex items-center gap-4 p-3 bg-white/20 dark:bg-black/20 backdrop-blur-sm rounded-lg">
                        <RankIcon className={cn("h-8 w-8", iconColor)} />
                        <Avatar className='h-12 w-12'>
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-left flex-1">
                            <p className="font-bold text-lg text-primary-foreground dark:text-white">{user.name}</p>
                            {isLastClaimer ? (
                                <p className="text-white/90 dark:text-orange-950/90 font-mono text-sm">
                                    { (lastClaim.user.points - lastClaim.pointsAdded).toLocaleString() } + {lastClaim.pointsAdded} = <span className="font-bold">{lastClaim.user.points.toLocaleString()}</span>
                                </p>
                            ) : (
                                <p className="text-white/90 dark:text-orange-950/90">{user.points.toLocaleString()} points</p>
                            )}
                        </div>
                        <div className="font-bold text-2xl text-white dark:text-orange-950">#{index + 1}</div>
                    </div>
                )
            })}
        </div>
        <Button onClick={() => onOpenChange(false)} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-orange-800 dark:text-orange-100 dark:hover:bg-orange-900">
            Awesome!
        </Button>
      </DialogContent>
    </Dialog>
  );
}
