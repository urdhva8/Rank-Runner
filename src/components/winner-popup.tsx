
"use client";

import { useEffect, useRef } from 'react';
import type { User } from '@/types';
import { useTheme } from 'next-themes';
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
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (isOpen && !isFirstRender.current) {
        const colors = resolvedTheme === 'dark' 
            ? ['#e5e7eb', '#d1d5db', '#9ca3af', '#6b7280', '#ffffff'] // Silver/gray colors for dark theme
            : ['#f59e0b', '#fbbf24', '#fcd34d', '#fef3c7', '#ffffff']; // Gold/amber colors for light theme
      
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.4 },
        angle: 90,
        startVelocity: 40,
        ticks: 300,
        gravity: 1,
        colors: colors,
      });
    }
    if (isFirstRender.current) {
      isFirstRender.current = false;
    }
  }, [isOpen, resolvedTheme]);
  
  if (users.length === 0) return null;

  const isDarkTheme = resolvedTheme === 'dark';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
       <DialogContent 
        className={cn(
          "sm:max-w-md text-center p-8 border-0 transition-colors duration-300",
          isDarkTheme 
            ? "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-200 via-gray-300 to-slate-400 text-gray-900" 
            : "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-600 via-yellow-600 to-amber-700 text-white"
        )}
      >
        <DialogHeader className="items-center">
            <Trophy className="h-16 w-16 drop-shadow-lg text-yellow-400" />
            <DialogTitle className={cn("text-3xl font-bold tracking-tighter mt-4", isDarkTheme ? 'text-gray-900' : 'text-white')}>
                Top Champions!
            </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
            {users.map((user, index) => {
                const RankIcon = rankIcons[index]?.icon || Award;
                const iconColor = rankIcons[index]?.color;

                return (
                    <div key={user.id} 
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-lg border",
                        isDarkTheme ? "bg-white/30 backdrop-blur-sm border-black/20" : "bg-black/20 backdrop-blur-sm border-white/10"
                      )}
                    >
                        <RankIcon className={cn("h-8 w-8", iconColor)} />
                        <Avatar className={cn('h-12 w-12 border-2', isDarkTheme ? 'border-gray-800/30' : 'border-white/20')}>
                          <AvatarFallback className={cn(isDarkTheme ? 'bg-slate-500 text-white' : 'bg-amber-800 text-white' )}>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-left flex-1">
                            <p className={cn("font-bold text-lg", isDarkTheme ? "text-gray-900" : "text-white")}>{user.name}</p>
                            <p className={cn(isDarkTheme ? "text-slate-700/90" : "text-amber-200/90")}>{user.points.toLocaleString()} points</p>
                        </div>
                        <div className={cn("font-bold text-2xl", isDarkTheme ? "text-gray-900" : "text-white")}>#{index + 1}</div>
                    </div>
                )
            })}
        </div>
        <Button onClick={() => onOpenChange(false)} className={cn(
            "mt-4 ring-offset-background focus-visible:ring-2",
            isDarkTheme 
              ? "bg-slate-800 text-white hover:bg-slate-900/90 focus-visible:ring-slate-950" 
              : "bg-amber-400 text-amber-950 hover:bg-amber-400/90 focus-visible:ring-white"
          )}>
            Awesome!
        </Button>
        <DialogClose className={cn(
          "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 disabled:pointer-events-none",
          isDarkTheme ? "text-gray-800 hover:text-gray-900/80 focus:ring-gray-950" : "text-white hover:text-white/80 focus:ring-white"
          )}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
      </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
