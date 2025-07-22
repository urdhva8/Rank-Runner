
import { ObjectId } from "mongodb";

export type User = {
  _id?: ObjectId;
  id: string;
  name: string;
  points: number;
  avatarUrl: string;
};

export type PointHistory = {
  _id?: ObjectId;
  userId: ObjectId;
  pointsClaimed: number;
  timestamp: Date;
  totalPointsAfterClaim: number;
};

export type PointHistoryWithUser = {
  _id: ObjectId | string;
  userName: string;
  userAvatarUrl: string;
  pointsClaimed: number;
  timestamp: Date | string;
  totalPointsAfterClaim: number;
};
