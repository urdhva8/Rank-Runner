
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
        ? ['#a855f7', '#c084fc', '#d8b4fe', '#f3e8ff', '#ffffff']
        : ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#ffffff'];
      
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
            ? "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900 via-purple-950 to-black text-white" 
            : "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-blue-500 via-blue-600 to-blue-800 text-white"
        )}
      >
        <DialogHeader className="items-center">
            <Trophy className="h-16 w-16 drop-shadow-lg text-yellow-400" />
            <DialogTitle className="text-3xl font-bold tracking-tighter mt-4 text-white">
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
                        "bg-black/20 backdrop-blur-sm",
                         isDarkTheme ? "border-white/20" : "border-white/10"
                      )}
                    >
                        <RankIcon className={cn("h-8 w-8", iconColor)} />
                        <Avatar className={cn('h-12 w-12 border-2', isDarkTheme ? 'border-white/30' : 'border-white/20')}>
                          <AvatarFallback className={cn(isDarkTheme ? 'bg-purple-800 text-white' : 'bg-blue-900 text-white' )}>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-left flex-1">
                            <p className="font-bold text-lg text-white">{user.name}</p>
                            <p className={cn(isDarkTheme ? "text-purple-200/90" : "text-blue-200/90")}>{user.points.toLocaleString()} points</p>
                        </div>
                        <div className="font-bold text-2xl text-white">#{index + 1}</div>
                    </div>
                )
            })}
        </div>
        <Button onClick={() => onOpenChange(false)} className={cn(
            "mt-4 ring-offset-background focus-visible:ring-2 focus-visible:ring-white",
            isDarkTheme 
              ? "bg-purple-300 text-purple-950 hover:bg-purple-300/90" 
              : "bg-blue-900 text-blue-100 hover:bg-blue-950/90"
          )}>
            Awesome!
        </Button>
        <DialogClose className={cn(
          "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-white disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
          "text-white hover:text-white/80"
          )}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
      </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
