
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
    { icon: Trophy, color: "text-yellow-400", darkColor: "text-yellow-400" },
    { icon: Medal, color: "text-slate-500", darkColor: "text-slate-400" },
    { icon: Award, color: "text-orange-600", darkColor: "text-orange-500" },
];

export function PodiumPopup({ users, isOpen, onOpenChange, lastClaim }: PodiumPopupProps) {
  const isFirstRender = useRef(true);
  const { resolvedTheme } = useTheme();

  useEffect(() => {
    if (isOpen && !isFirstRender.current) {
      const colors = resolvedTheme === 'dark'
        ? ['#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffffff'] // Light theme colors
        : ['#FFD700', '#FFC700', '#FFB700', '#FFA500', '#FFFFFF', '#C0C0C0']; // Dark theme colors
      
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

  const isDarkPopup = resolvedTheme === 'light';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
       <DialogContent 
        className={cn(
          "sm:max-w-md text-center p-8 border-0 transition-colors duration-300",
          isDarkPopup 
            ? "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-500 via-orange-600 to-orange-800" 
            : "bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-100 via-orange-200 to-orange-50"
        )}
      >
        <DialogHeader className="items-center">
            <Trophy className={cn("h-16 w-16 drop-shadow-lg", isDarkPopup ? "text-yellow-400" : "text-yellow-500")} />
            <DialogTitle className={cn("text-3xl font-bold tracking-tighter mt-4", isDarkPopup ? "text-white" : "text-orange-900")}>
                Top Champions!
            </DialogTitle>
        </DialogHeader>
        <div className="py-4 space-y-4">
            {users.map((user, index) => {
                const RankIcon = rankIcons[index]?.icon || Award;
                const iconColor = isDarkPopup ? rankIcons[index]?.darkColor : rankIcons[index]?.color;

                return (
                    <div key={user.id} 
                      className={cn(
                        "flex items-center gap-4 p-3 rounded-lg border",
                        isDarkPopup 
                          ? "bg-black/20 backdrop-blur-sm border-white/10" 
                          : "bg-white/50 backdrop-blur-sm border-orange-200/50"
                      )}
                    >
                        <RankIcon className={cn("h-8 w-8", iconColor)} />
                        <Avatar className={cn('h-12 w-12 border-2', isDarkPopup ? 'border-white/20' : 'border-orange-200')}>
                          <AvatarFallback className={cn(isDarkPopup ? 'bg-orange-800 text-white' : 'bg-orange-200 text-orange-800' )}>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="text-left flex-1">
                            <p className={cn("font-bold text-lg", isDarkPopup ? "text-white" : "text-orange-900")}>{user.name}</p>
                            <p className={cn(isDarkPopup ? "text-orange-200/90" : "text-orange-800/90")}>{user.points.toLocaleString()} points</p>
                        </div>
                        <div className={cn("font-bold text-2xl", isDarkPopup ? "text-white" : "text-orange-900")}>#{index + 1}</div>
                    </div>
                )
            })}
        </div>
        <Button onClick={() => onOpenChange(false)} className={cn(
            "mt-4 ring-offset-background focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            isDarkPopup 
              ? "bg-orange-900 text-orange-100 hover:bg-orange-950/90" 
              : "bg-white text-orange-900 hover:bg-white/90"
          )}>
            Awesome!
        </Button>
        <DialogClose className={cn(
          "absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground",
          isDarkPopup ? "text-white hover:text-white/80" : "text-orange-900 hover:text-orange-900/80"
          )}>
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
      </DialogClose>
      </DialogContent>
    </Dialog>
  );
}
