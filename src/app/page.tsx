
"use client";

import { useState, useMemo, useRef, useEffect, useTransition } from "react";
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
import { PodiumPopup } from "@/components/winner-popup";
import { getUsers, addUser, claimPoints } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";


const getTopThreeUsers = (users: User[]) => {
  return [...users].sort((a, b) => b.points - a.points).slice(0, 3);
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [topThree, setTopThree] = useState<User[]>([]);
  const [isPodiumPopupOpen, setIsPodiumPopupOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    startTransition(async () => {
      const initialUsers = await getUsers();
      setUsers(initialUsers);
      setTopThree(getTopThreeUsers(initialUsers));
    });
  }, []);

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

    startTransition(async () => {
        const { updatedUser, newTopThree } = await claimPoints(selectedUserId);
        setUsers(currentUsers => currentUsers.map(u => u.id === updatedUser.id ? updatedUser : u).sort((a, b) => b.points - a.points));
        setTopThree(newTopThree);
        setIsPodiumPopupOpen(true);
    });
  };

  const handleAddUser = (name: string) => {
    startTransition(async () => {
        const newUser = await addUser(name);
        setUsers((currentUsers) => [...currentUsers, newUser]);
    });
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
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
                  <SelectContent side="bottom">
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
                disabled={!selectedUserId || isPending}
                className="w-full bg-accent-foreground text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                {isPending ? "Claiming..." : <> <Sparkles className="mr-2 h-5 w-5" /> Claim Points</> }
              </Button>
            </CardContent>
          </Card>
          <AddUserDialog onUserAdd={handleAddUser} />
        </div>

        <div className="lg:col-span-2">
          {isPending && users.length === 0 ? (
             <Card className="w-full shadow-lg">
                <CardHeader>
                    <CardTitle className="text-center text-2xl font-bold tracking-tight">Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                        <Skeleton className="h-12 w-full" />
                    </div>
                </CardContent>
             </Card>
          ) : (
            <Leaderboard users={users} />
          )}
        </div>
      </div>
       <PodiumPopup
          users={topThree}
          isOpen={isPodiumPopupOpen}
          onOpenChange={setIsPodiumPopupOpen}
        />
    </main>
  );
}
