"use client";

import { useState, useMemo, useRef } from "react";
import type { User } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AddUserDialog } from "@/components/add-user-dialog";
import { Leaderboard } from "@/components/leaderboard";
import { Sparkles } from "lucide-react";
import confetti from "canvas-confetti";
import { ThemeToggle } from "@/components/theme-toggle";

const initialUsers: User[] = [
  { id: '3', name: 'Charlie', points: 200, avatarUrl: 'https://placehold.co/100x100.png' },
  { id: '10', name: 'Jane', points: 195, avatarUrl: 'https://placehold.co/100x100.png' },
  { id: '5', name: 'Ethan', points: 180, avatarUrl: 'https://placehold.co/100x100.png' },
  { id: '8', name: 'Hannah', points: 165, avatarUrl: 'https://placehold.co/100x100.png' },
  { id: '1', name: 'Alice', points: 150, avatarUrl: 'https://placehold.co/100x100.png' },
  { id: '2', name: 'Bob', points: 120, avatarUrl: 'https://placehold.co/100x100.png' },
  { id: '7', name: 'George', points: 110, avatarUrl: 'https://placehold.co/100x100.png' },
  { id: '4', name: 'Diana', points: 90, avatarUrl: 'https://placehold.co/100x100.png' },
  { id: '9', name: 'Ian', points: 75, avatarUrl: 'https://placehold.co/100x100.png' },
  { id: '6', name: 'Fiona', points: 50, avatarUrl: 'https://placehold.co/100x100.png' },
];

export default function Home() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const claimButtonRef = useRef<HTMLButtonElement>(null);

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId),
    [users, selectedUserId]
  );

  const handleClaimPoints = () => {
    if (!selectedUserId) return;

    if (claimButtonRef.current) {
      const rect = claimButtonRef.current.getBoundingClientRect();
      const origin = {
        x: (rect.left + rect.right) / 2 / window.innerWidth,
        y: (rect.top + rect.bottom) / 2 / window.innerHeight,
      };
      confetti({
        particleCount: 100,
        spread: 70,
        origin: origin,
      });
    }

    const pointsToAdd = Math.floor(Math.random() * 10) + 1;
    setUsers((currentUsers) =>
      currentUsers.map((user) =>
        user.id === selectedUserId
          ? { ...user, points: user.points + pointsToAdd }
          : user
      )
    );
  };
  
  const handleAddUser = (newUser: User) => {
    setUsers((currentUsers) => [...currentUsers, newUser]);
  };

  return (
    <main className="container mx-auto p-4 md:p-8 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-100 via-orange-50 to-background dark:from-yellow-900/40 dark:via-orange-950/20 dark:to-background">
       <header className="text-center mb-12 relative">
        <div className="absolute top-0 right-0">
          <ThemeToggle />
        </div>
        <h1 className="text-5xl font-bold tracking-tighter text-primary">RankRunner</h1>
        <p className="text-muted-foreground mt-2 text-lg">Claim your points and climb the ranks!</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Select User</label>
                <Select onValueChange={setSelectedUserId} value={selectedUserId || ""}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Choose a user..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              {selectedUser && (
                <div className="p-4 bg-secondary/50 rounded-lg text-center space-y-2 transition-all duration-300">
                    <p className="text-lg font-semibold">{selectedUser.name}'s Points</p>
                    <p className="text-3xl font-bold text-primary">{selectedUser.points.toLocaleString()}</p>
                </div>
              )}

              <Button
                ref={claimButtonRef}
                onClick={handleClaimPoints}
                disabled={!selectedUserId}
                className="w-full bg-accent-foreground text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Claim Points
              </Button>
            </CardContent>
          </Card>
          <AddUserDialog onUserAdd={handleAddUser} />
        </div>

        <div className="lg:col-span-2">
          <Leaderboard users={users} />
        </div>
      </div>
    </main>
  );
}
