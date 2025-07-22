
"use client";

import { Trophy, Medal, Award } from "lucide-react";
import type { User } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface LeaderboardProps {
  users: User[];
}

const PodiumItem = ({ user, rank }: { user: User, rank: number }) => {
  const rankStyles = [
    // Rank 1
    {
      order: "order-1 md:order-2",
      offset: "md:-translate-y-8",
      size: "w-32 h-32",
      name: "text-xl",
      icon: <Trophy className="h-8 w-8 text-yellow-400" />,
      color: "bg-yellow-400/20 dark:bg-yellow-400/10",
      border: "border-yellow-500"
    },
    // Rank 2
    {
      order: "order-2 md:order-1",
      offset: "md:translate-y-4",
      size: "w-28 h-28",
      name: "text-lg",
      icon: <Medal className="h-8 w-8 text-slate-400" />,
      color: "bg-slate-400/20 dark:bg-slate-400/10",
      border: "border-slate-500"
    },
    // Rank 3
    {
      order: "order-3",
      offset: "md:translate-y-4",
      size: "w-28 h-28",
      name: "text-lg",
      icon: <Award className="h-8 w-8 text-orange-500" />,
      color: "bg-orange-500/20 dark:bg-orange-500/10",
      border: "border-orange-600"
    },
  ];
  const style = rankStyles[rank - 1];

  return (
    <div className={cn("flex flex-col items-center p-4 rounded-lg transition-transform duration-300 ease-in-out hover:scale-105", style.order, style.offset, style.color)}>
      {style.icon}
      <Avatar className={cn("mt-2 border-4 transition-transform duration-300", style.size, style.border)}>
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <h3 className={cn("mt-4 font-bold text-card-foreground", style.name)}>{user.name}</h3>
      <p className="text-muted-foreground">{user.points.toLocaleString()} pts</p>
    </div>
  );
};

const LeaderboardListItem = ({ user, rank }: { user: User, rank: number }) => (
    <div className="flex items-center justify-between p-4 transition-all duration-300 hover:bg-secondary/50 rounded-lg">
      <div className="flex items-center gap-4">
        <span className="text-lg font-bold text-muted-foreground w-6 text-center">{rank}</span>
        <Avatar>
          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <p className="font-medium">{user.name}</p>
      </div>
      <p className="font-bold text-primary">{user.points.toLocaleString()} pts</p>
    </div>
);

export function Leaderboard({ users }: LeaderboardProps) {
  const sortedUsers = [...users].sort((a, b) => (a.rank ?? Infinity) - (b.rank ?? Infinity));
  const topThree = sortedUsers.slice(0, 3);
  const rest = sortedUsers.slice(3);

  return (
    <Card className="w-full shadow-lg bg-card/60 dark:bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="text-center text-2xl font-bold tracking-tight">Leaderboard</CardTitle>
      </CardHeader>
      <CardContent>
        {topThree.length > 0 && (
          <div className="flex flex-col md:flex-row justify-center items-end gap-4 md:gap-8 mt-8 mb-12 border-b pb-12">
            {topThree.length >= 2 && <PodiumItem key={topThree[1].id} user={topThree[1]} rank={2} />}
            {topThree.length >= 1 && <PodiumItem key={topThree[0].id} user={topThree[0]} rank={1} />}
            {topThree.length >= 3 && <PodiumItem key={topThree[2].id} user={topThree[2]} rank={3} />}
          </div>
        )}
        
        <div className="space-y-2">
            {rest.map((user) => (
                <LeaderboardListItem key={user.id} user={user} rank={user.rank} />
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
