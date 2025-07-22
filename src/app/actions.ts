
"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import type { User, PointHistory, PointHistoryWithUser } from "@/types";
import { Collection, ObjectId } from "mongodb";


async function getCollection<T extends Document>(name: string): Promise<Collection<T> | null> {
    try {
        const { db } = await connectToDatabase();
        if (!db) {
            console.warn(`Database not connected. Cannot get collection "${name}".`);
            return null;
        }
        return db.collection<T>(name);
    } catch (e) {
        console.error("Error getting collection:", e);
        return null;
    }
}

const toPlainUserObject = (user: any): User => {
    return {
        ...user,
        _id: user._id.toString(),
        id: user._id.toString(),
    };
};

export async function getUsers(): Promise<User[]> {
    const usersCollection = await getCollection<User>("users");

    if (!usersCollection) {
        console.log("Users collection not found, returning empty list.");
        return [];
    }
    
    console.log("Successfully fetched users collection reference.");

    const users = await usersCollection.find({}).sort({ points: -1 }).toArray();
    return users.map(toPlainUserObject);
}

export async function addUser(name: string): Promise<User> {
    const usersCollection = await getCollection<User>("users");

    if (!usersCollection) {
       throw new Error("Database not connected. Cannot add user.");
    }
    
    const userCount = await usersCollection.countDocuments();
    const newUser: Omit<User, 'id' | '_id' | 'rank'> & { rank?: number } = {
        name,
        points: 0,
        avatarUrl: `https://placehold.co/100x100.png`,
        rank: userCount + 1,
    };
    const result = await usersCollection.insertOne(newUser as any);
    console.log(`User "${name}" added to DB with ID: ${result.insertedId}`);
    
    await updateRanks(usersCollection);
    revalidatePath("/");

    const addedUser = await usersCollection.findOne({_id: result.insertedId});
    if (!addedUser) throw new Error("Could not find newly added user");

    return toPlainUserObject(addedUser);
}

async function updateRanks(usersCollection: Collection<User>) {
    const allUsers = await usersCollection.find().sort({ points: -1 }).toArray();
    const bulkOps = allUsers.map((user, index) => ({
      updateOne: {
        filter: { _id: user._id },
        update: { $set: { rank: index + 1 } },
      },
    }));
  
    if (bulkOps.length > 0) {
      await usersCollection.bulkWrite(bulkOps as any[]);
      console.log("Successfully updated ranks for all users.");
    }
}

export async function claimPoints(userId: string): Promise<{ updatedUser: User, newTopThree: User[], pointsAdded: number }> {
    const usersCollection = await getCollection<User>("users");
    const pointsToAdd = Math.floor(Math.random() * 10) + 1;

    if (!usersCollection) {
        throw new Error("Database not connected. Cannot claim points.");
    }
    
    const historyCollection = await getCollection<PointHistory>("pointHistory");

    const result = await usersCollection.findOneAndUpdate(
        { _id: new ObjectId(userId) },
        { $inc: { points: pointsToAdd } },
        { returnDocument: 'after' }
    );

    if (!result) {
        throw new Error("User not found in DB");
    }
    
    console.log(`User ${result.name} claimed ${pointsToAdd} points.`);
    
    if (historyCollection) {
        await historyCollection.insertOne({
            userId: new ObjectId(userId),
            pointsClaimed: pointsToAdd,
            timestamp: new Date(),
            totalPointsAfterClaim: result.points,
        });
        console.log("Point claim history saved to DB.");
    }
    
    await updateRanks(usersCollection);
    
    const updatedUserWithRank = await usersCollection.findOne({ _id: new ObjectId(userId) });
    if (!updatedUserWithRank) {
        throw new Error("Failed to retrieve updated user after ranking.");
    }
    
    const newTopThree = await usersCollection.find().sort({ points: -1 }).limit(3).toArray();
    revalidatePath("/");
    
    return { 
        updatedUser: toPlainUserObject(updatedUserWithRank), 
        newTopThree: newTopThree.map(toPlainUserObject), 
        pointsAdded: pointsToAdd 
    };
}

export async function getPointHistory(): Promise<PointHistoryWithUser[]> {
    const historyCollection = await getCollection<PointHistory>("pointHistory");
    if (!historyCollection) {
       console.log("DB not connected. Cannot get point history.");
       return [];
    }

    const history = await historyCollection.aggregate([
        { $sort: { timestamp: -1 } },
        { $limit: 50 },
        {
            $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "userDetails"
            }
        },
        { $unwind: "$userDetails" },
        {
            $project: {
                _id: 1,
                pointsClaimed: 1,
                timestamp: 1,
                totalPointsAfterClaim: 1,
                userName: "$userDetails.name",
                userAvatarUrl: "$userDetails.avatarUrl"
            }
        }
    ]).toArray();

    return history.map(item => ({
        ...item,
        _id: (item._id as ObjectId).toString(),
        timestamp: (item.timestamp as Date).toISOString(),
    })) as PointHistoryWithUser[];
}
