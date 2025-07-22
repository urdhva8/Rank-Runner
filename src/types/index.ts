
import type { Document as MongoDocument, ObjectId } from "mongodb";

export interface User extends MongoDocument {
  _id: ObjectId | string;
  id: string;
  name: string;
  points: number;
  avatarUrl: string;
  rank: number;
};

export interface PointHistory extends MongoDocument {
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
