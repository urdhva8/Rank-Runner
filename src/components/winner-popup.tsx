
"use client";

import { useEffect, useRef } from 'react';
import type { User } from '@/types';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import { Award, Medal, Trophy, X } from 'lucide-react';
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
      <DialogContent className="sm:max-w-md text-center p-8 border-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500 via-orange-600 to-orange-800">
        <DialogHeader className="items-center">
            <Trophy className="h-16 w-16 text-yellow-400 drop-shadow-lg" />
            <DialogTitle className="text-3xl font-bold tracking-tighter text-white mt-4">
                Top Champions!
            </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
            {users.map((user, index) => {
                const RankIcon = rankIcons[index]?.icon || Award;
                const iconColor = rankIcons[index]?.color || "text-muted-foreground";

                return (
                    <div key={user.id} className="flex items-center gap-4 p-3 bg-black/20 backdrop-blur-sm rounded-lg border border-white/10">
                        <RankIcon className={cn("h-8 w-8", iconColor)} />
                        <Avatar className='h-12 w-12 border-2 border-white/20'>
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-left flex-1">
                            <p className="font-bold text-lg text-white">{user.name}</p>
                            <p className="text-orange-200/90">{user.points.toLocaleString()} points</p>
                        </div>
                        <div className="font-bold text-2xl text-white">#{index + 1}</div>
                    </div>
                )
            })}
        </div>
        <Button onClick={() => onOpenChange(false)} className="mt-4 bg-orange-900 text-orange-100 hover:bg-orange-950/90 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
            Awesome!
        </Button>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground text-white hover:text-white/80">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
      </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
