
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
            ? ['#fde047', '#ffb700', '#f59e0b', '#d97706', '#ffffff']
            : ['#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8', '#ffffff'];
      
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
            ? "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-800 via-red-900 to-black text-white" 
            : "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-green-300 via-blue-400 to-teal-400 text-slate-800"
        )}
      >
        <DialogHeader className="items-center">
            <Trophy className={cn("h-16 w-16 drop-shadow-lg", isDarkTheme ? "text-yellow-300" : "text-yellow-500")} />
            <DialogTitle className={cn("text-3xl font-bold tracking-tighter mt-4", isDarkTheme ? "text-white" : "text-slate-900")}>
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
                        isDarkTheme ? "bg-black/20 backdrop-blur-sm border-white/10" : "bg-black/10 backdrop-blur-sm border-white/20"
                      )}
                    >
                        <RankIcon className={cn("h-8 w-8", iconColor)} />
                        <Avatar className={cn('h-12 w-12 border-2', isDarkTheme ? 'border-yellow-400/50' : 'border-slate-600/50')}>
                          <AvatarFallback className={cn(isDarkTheme ? 'bg-red-900 text-orange-200' : 'bg-teal-500 text-white' )}>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-left flex-1">
                            <p className={cn("font-bold text-lg", isDarkTheme ? "text-white" : "text-slate-800")}>{user.name}</p>
                            <p className={cn(isDarkTheme ? "text-orange-300/80" : "text-slate-600/90")}>{user.points.toLocaleString()} points</p>
                        </div>
                        <div className={cn("font-bold text-2xl", isDarkTheme ? "text-white" : "text-slate-800")}>#{index + 1}</div>
                    </div>
                )
            })}
        </div>
        <Button onClick={() => onOpenChange(false)} className={cn(
            "mt-4 ring-offset-background focus-visible:ring-2",
            isDarkTheme 
              ? "bg-yellow-400 text-slate-950 hover:bg-yellow-400/90 focus-visible:ring-yellow-300" 
              : "bg-slate-800 text-white hover:bg-slate-800/90 focus-visible:ring-slate-700"
          )}>
            Awesome!
        </Button>
        <DialogClose className={cn(
          "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 disabled:pointer-events-none",
           isDarkTheme ? "text-white hover:text-white/80 focus:ring-white" : "text-slate-800 hover:text-slate-800/80 focus:ring-slate-800"
          )}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
      </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
