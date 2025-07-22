
import type { Document, ObjectId } from "mongodb";

export type User = Document & {
  _id: string;
  id: string;
  name: string;
  points: number;
  avatarUrl: string;
  rank: number;
};

export type PointHistory = Document & {
  _id?: ObjectId;
  userId: ObjectId;
  pointsClaimed: number;
  timestamp: Date;
  totalPointsAfterClaim: number;
};

export type PointHistoryWithUser = {
  _id: string;
  userName: string;
  userAvatarUrl: string;
  pointsClaimed: number;
  timestamp: string;
  totalPointsAfterClaim: number;
};
