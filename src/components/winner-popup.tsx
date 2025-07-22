
"use client";

import { useEffect, useRef, useState } from 'react';
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
    { icon: Trophy, color: "text-slate-800" },
    { icon: Medal, color: "text-slate-800" },
    { icon: Award, color: "text-slate-800" },
];

export function PodiumPopup({ users, isOpen, onOpenChange, lastClaim }: PodiumPopupProps) {
  const isFirstRender = useRef(true);
  const { resolvedTheme } = useTheme();
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (isOpen) {
      setCountdown(3); // Reset countdown when popup opens
      const timer = setInterval(() => {
        setCountdown((prevCountdown) => {
          if (prevCountdown <= 1) {
            clearInterval(timer);
            onOpenChange(false);
            return 0;
          }
          return prevCountdown - 1;
        });
      }, 1000);

      // Cleanup interval on component unmount or if popup is closed manually
      return () => clearInterval(timer);
    }
  }, [isOpen, onOpenChange]);

  useEffect(() => {
    if (isOpen && !isFirstRender.current) {
      const lightColors = ['#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#ffffff'];
      const darkColors = ['#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b', '#ffffff'];
        
      confetti({
        particleCount: 200,
        spread: 90,
        origin: { y: 0.4 },
        angle: 90,
        startVelocity: 40,
        ticks: 300,
        gravity: 1,
        colors: resolvedTheme === 'dark' ? lightColors : darkColors,
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
            ? "bg-[#fd812d] text-slate-900 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/20 to-transparent" 
            : "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-sky-400 to-blue-600 text-white"
        )}
      >
        <DialogHeader className="items-center">
            <Trophy className={cn("h-16 w-16 drop-shadow-lg", isDarkTheme ? "text-yellow-400" : "text-yellow-300")} />
            <DialogTitle className={cn("text-3xl font-bold tracking-tighter mt-4", isDarkTheme ? "text-slate-900" : "text-white")}>
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
                        isDarkTheme ? "bg-black/10 backdrop-blur-sm border-black/20" : "bg-black/20 backdrop-blur-sm border-white/10"
                      )}
                    >
                        <RankIcon className={cn("h-8 w-8", isDarkTheme ? "text-slate-800" : iconColor)} />
                        <Avatar className={cn('h-12 w-12 border-2', isDarkTheme ? 'border-orange-800/50' : 'border-sky-300/50')}>
                          <AvatarFallback className={cn(isDarkTheme ? 'bg-slate-800 text-white' : 'bg-sky-900 text-sky-200' )}>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-left flex-1">
                            <p className={cn("font-bold text-lg", isDarkTheme ? "text-slate-900" : "text-white")}>{user.name}</p>
                            <p className={cn(isDarkTheme ? "text-amber-950" : "text-sky-200/90")}>{user.points.toLocaleString()} points</p>
                        </div>
                        <div className={cn("font-bold text-2xl", isDarkTheme ? "text-slate-900" : "text-white")}>#{index + 1}</div>
                    </div>
                )
            })}
        </div>
        <Button onClick={() => onOpenChange(false)} className={cn(
            "mt-4 w-full ring-offset-background focus-visible:ring-2",
            isDarkTheme 
              ? "bg-slate-800 text-white hover:bg-slate-800/90 focus-visible:ring-slate-700"
              : "bg-sky-200 text-sky-950 hover:bg-sky-200/90 focus-visible:ring-sky-100"
          )}>
            Awesome! ({countdown}s)
        </Button>
        <DialogClose className={cn(
          "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 disabled:pointer-events-none",
           isDarkTheme ? "text-slate-800 hover:text-slate-800/80 focus:ring-slate-800" : "text-white hover:text-white/80 focus:ring-white"
          )}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
      </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
