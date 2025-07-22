
import { ObjectId } from "mongodb";

export type User = {
  _id: string; // Changed from ObjectId
  id: string;
  name: string;
  points: number;
  avatarUrl: string;
  rank: number;
};

export type PointHistory = {
  _id?: ObjectId;
  userId: ObjectId;
  pointsClaimed: number;
  timestamp: Date;
  totalPointsAfterClaim: number;
};

export type PointHistoryWithUser = {
  _id: string; // Changed from ObjectId | string
  userName: string;
  userAvatarUrl: string;
  pointsClaimed: number;
  timestamp: string; // Changed from Date | string
  totalPointsAfterClaim: number;
};
