
"use client";

import { useState, useMemo, useRef, useEffect, useTransition } from "react";
import type { PointHistoryWithUser, User } from "@/types";
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
import { Sparkles, History, Crown } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import { PodiumPopup } from "@/components/winner-popup";
import { getUsers, addUser, claimPoints, getPointHistory } from "./actions";
import { Skeleton } from "@/components/ui/skeleton";
import { HistoryDialog } from "@/components/history-dialog";


const getTopThreeUsers = (users: User[]) => {
  return [...users].sort((a, b) => b.points - a.points).slice(0, 3);
}

export default function Home() {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [topThree, setTopThree] = useState<User[]>([]);
  const [isPodiumPopupOpen, setIsPodiumPopupOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [pointHistory, setPointHistory] = useState<PointHistoryWithUser[]>([]);
  const [lastClaim, setLastClaim] = useState<{user: User; pointsAdded: number} | null>(null);
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

    startTransition(async () => {
        const { updatedUser, newTopThree, pointsAdded } = await claimPoints(selectedUserId);
        setLastClaim({ user: updatedUser, pointsAdded });
        setUsers(currentUsers => currentUsers.map(u => u.id === updatedUser.id ? updatedUser : u).sort((a, b) => b.points - a.points));
        setTopThree(newTopThree);
        setIsPodiumPopupOpen(true);
    });
  };

  const handleAddUser = (name: string) => {
    startTransition(async () => {
        const newUser = await addUser(name);
        setUsers((currentUsers) => [...currentUsers, newUser].sort((a, b) => b.points - a.points));
    });
  };

  const handleShowHistory = () => {
    startTransition(async () => {
        const history = await getPointHistory();
        setPointHistory(history);
        setIsHistoryOpen(true);
    });
  }

  return (
    <main className="container mx-auto p-4 md:p-8 relative overflow-hidden min-h-screen">
       <div 
        className="absolute inset-0 z-0 opacity-30 dark:opacity-20"
        style={{
          backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 80 80' width='80' height='80'%3E%3Cpath fill='%239C92AC' fill-opacity='0.4' d='M14 16H9v-2h5V9.87a4 4 0 1 1 2 0V14h5v2h-5v5.13a4 4 0 1 1-2 0V16zM22 4.13a4 4 0 1 1 2 0V9h5v2h-5v5.13a4 4 0 1 1-2 0V11h-5V9h5V4.13zM40 25.13a4 4 0 1 1 2 0V30h5v2h-5v5.13a4 4 0 1 1-2 0V32h-5v-2h5v-4.87zM54 34h-5v-2h5v-5.13a4 4 0 1 1 2 0V29h5v2h-5v5.13a4 4 0 1 1-2 0V34zM62 20.13a4 4 0 1 1 2 0V25h5v2h-5v5.13a4 4 0 1 1-2 0V27h-5v-2h5v-4.87zM74 15.13a4 4 0 1 1 2 0V20h5v2h-5v5.13a4 4 0 1 1-2 0V22h-5v-2h5v-4.87z'/%3E%3C/svg%3E\")"
       }}
      />
      <div className="relative z-10">
        <header className="text-center mb-12 relative">
          <div className="absolute top-0 right-0">
            <ThemeToggle />
          </div>
          <div className="flex justify-center items-center gap-4">
            <Crown className="text-5xl text-primary drop-shadow-lg" />
            <h1 className="text-5xl font-bold tracking-tighter text-foreground dark:text-white">RankRunner</h1>
          </div>
          <p className="text-muted-foreground dark:text-cyan-300 mt-2 text-lg">Claim your points and climb the ranks!</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-1 space-y-6">
            <Card className="bg-card/60 dark:bg-card/80 backdrop-blur-sm">
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
                  className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                  size="lg"
                >
                  {isPending ? "Claiming..." : <> <Sparkles className="mr-2 h-5 w-5" /> Claim Points</> }
                </Button>
              </CardContent>
            </Card>
            <div className="grid grid-cols-2 gap-4">
              <AddUserDialog onUserAdd={handleAddUser} />
              <Button variant="outline" onClick={handleShowHistory} disabled={isPending}>
                  <History className="mr-2 h-4 w-4" />
                  View History
              </Button>
            </div>
          </div>

          <div className="lg:col-span-2">
            {isPending && users.length === 0 ? (
              <Card className="w-full shadow-lg bg-card/60 dark:bg-card/80 backdrop-blur-sm">
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
      </div>
       <PodiumPopup
          users={topThree}
          isOpen={isPodiumPopupOpen}
          onOpenChange={setIsPodiumPopupOpen}
          lastClaim={lastClaim}
        />
        <HistoryDialog 
            isOpen={isHistoryOpen}
            onOpenChange={setIsHistoryOpen}
            history={pointHistory}
        />
    </main>
  );
}
