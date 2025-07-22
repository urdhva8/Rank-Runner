
"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import type { User, PointHistory, PointHistoryWithUser } from "@/types";
import { Collection, ObjectId } from "mongodb";

// --- In-memory data for when DB is not connected ---
let memoryUsers: User[] = [
    { id: '1', name: 'Charlie', points: 200, avatarUrl: 'https://placehold.co/100x100.png', rank: 1 },
    { id: '2', name: 'Jane', points: 195, avatarUrl: 'https://placehold.co/100x100.png', rank: 2 },
    { id: '3', name: 'Ethan', points: 180, avatarUrl: 'https://placehold.co/100x100.png', rank: 3 },
    { id: '4', name: 'Hannah', points: 165, avatarUrl: 'https://placehold.co/100x100.png', rank: 4 },
    { id: '5', name: 'Alice', points: 150, avatarUrl: 'https://placehold.co/100x100.png', rank: 5 },
    { id: '6', name: 'Bob', points: 120, avatarUrl: 'https://placehold.co/100x100.png', rank: 6 },
    { id: '7', name: 'George', points: 110, avatarUrl: 'https://placehold.co/100x100.png', rank: 7 },
    { id: '8', name: 'Diana', points: 90, avatarUrl: 'https://placehold.co/100x100.png', rank: 8 },
    { id: '9', name: 'Ian', points: 75, avatarUrl: 'https://placehold.co/100x100.png', rank: 9 },
    { id: '10', name: 'Fiona', points: 50, avatarUrl: 'https://placehold.co/100x100.png', rank: 10 },
].sort((a, b) => b.points - a.points);

let memoryHistory: PointHistoryWithUser[] = [];


async function getCollection<T extends Document>(name: string): Promise<Collection<T> | null> {
    try {
        const { db } = await connectToDatabase();
        if (!db) {
            console.warn(`Database not connected. Cannot get collection "${name}". Using in-memory data for some operations.`);
            return null;
        }
        console.log(`Successfully got collection: ${name}`);
        return db.collection<T>(name);
    } catch (e) {
        console.error("Error getting collection:", e);
        return null;
    }
}

export async function getUsers(): Promise<User[]> {
    const usersCollection = await getCollection<User>("users");

    if (!usersCollection) {
        console.log("Users collection not found, returning in-memory users for now.");
        return Promise.resolve(memoryUsers);
    }
    
    console.log("Successfully fetched users collection reference.");

    const userCount = await usersCollection.countDocuments();
    console.log(`Found ${userCount} users in the database.`);

    if (userCount === 0) {
        console.log("No users found in DB, seeding initial data...");
        const initialUsers: Omit<User, 'id'>[] = [
            { name: 'Charlie', points: 200, avatarUrl: 'https://placehold.co/100x100.png', rank: 1 },
            { name: 'Jane', points: 195, avatarUrl: 'https://placehold.co/100x100.png', rank: 2 },
            { name: 'Ethan', points: 180, avatarUrl: 'https://placehold.co/100x100.png', rank: 3 },
            { name: 'Hannah', points: 165, avatarUrl: 'https://placehold.co/100x100.png', rank: 4 },
            { name: 'Alice', points: 150, avatarUrl: 'https://placehold.co/100x100.png', rank: 5 },
            { name: 'Bob', points: 120, avatarUrl: 'https://placehold.co/100x100.png', rank: 6 },
            { name: 'George', points: 110, avatarUrl: 'https://placehold.co/100x100.png', rank: 7 },
            { name: 'Diana', points: 90, avatarUrl: 'https://placehold.co/100x100.png', rank: 8 },
            { name: 'Ian', points: 75, avatarUrl: 'https://placehold.co/100x100.png', rank: 9 },
            { name: 'Fiona', points: 50, avatarUrl: 'https://placehold.co/100x100.png', rank: 10 },
        ];
        try {
            await usersCollection.insertMany(initialUsers as any[]);
            console.log("Finished seeding initial data.");
        } catch (e) {
            console.error("Failed to seed initial user data:", e);
            // If seeding fails, something is wrong with the DB connection/permissions.
            // Return empty array to signal an error state.
            return [];
        }
    }

    const users = await usersCollection.find({}).sort({ points: -1 }).toArray();
    return users.map(user => ({ ...user, id: user._id.toString() }));
}

export async function addUser(name: string): Promise<User> {
    const usersCollection = await getCollection<User>("users");

    if (!usersCollection) {
        console.log("DB not connected. Adding user to in-memory store.");
        const newRank = memoryUsers.length + 1;
        const newUser: User = {
            id: (memoryUsers.length + 1).toString(),
            name,
            points: 0,
            avatarUrl: `https://placehold.co/100x100.png`,
            rank: newRank,
        };
        memoryUsers.push(newUser);
        revalidatePath("/");
        return Promise.resolve(newUser);
    }
    
    const userCount = await usersCollection.countDocuments();
    const newUser: Omit<User, 'id'> = {
        name,
        points: 0,
        avatarUrl: `https://placehold.co/100x100.png`,
        rank: userCount + 1,
    };
    const result = await usersCollection.insertOne(newUser as any);
    console.log(`User "${name}" added to DB with ID: ${result.insertedId}`);
    revalidatePath("/");
    return { ...newUser, id: result.insertedId.toString() };
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
      await usersCollection.bulkWrite(bulkOps);
      console.log("Successfully updated ranks for all users.");
    }
}

export async function claimPoints(userId: string): Promise<{ updatedUser: User, newTopThree: User[], pointsAdded: number }> {
    const usersCollection = await getCollection<User>("users");
    const pointsToAdd = Math.floor(Math.random() * 10) + 1;

    if (!usersCollection) {
        console.log("DB not connected. Claiming points in-memory.");
        let updatedUser: User | undefined;
        memoryUsers = memoryUsers.map(u => {
            if (u.id === userId) {
                updatedUser = { ...u, points: u.points + pointsToAdd };
                return updatedUser;
            }
            return u;
        });

        if (!updatedUser) {
            throw new Error("User not found in-memory");
        }
        
        memoryHistory.unshift({
            _id: new ObjectId().toString(),
            userName: updatedUser.name,
            userAvatarUrl: updatedUser.avatarUrl,
            pointsClaimed: pointsToAdd,
            timestamp: new Date().toISOString(),
            totalPointsAfterClaim: updatedUser.points,
        });

        memoryUsers.sort((a,b) => b.points - a.points);
        memoryUsers.forEach((user, index) => user.rank = index + 1);
        const newTopThree = memoryUsers.slice(0, 3);
        revalidatePath("/");
        return Promise.resolve({ updatedUser, newTopThree, pointsAdded: pointsToAdd });
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
    
    const finalUpdatedUser = { ...updatedUserWithRank, id: updatedUserWithRank._id.toString() };

    return { updatedUser: finalUpdatedUser, newTopThree: newTopThree.map(u => ({...u, id: u._id.toString()})), pointsAdded: pointsToAdd };
}

export async function getPointHistory(): Promise<PointHistoryWithUser[]> {
    const historyCollection = await getCollection<PointHistory>("pointHistory");
    if (!historyCollection) {
        console.log("DB not connected. Getting point history from in-memory store.");
        return Promise.resolve(memoryHistory.map(item => ({
            ...item,
            _id: item._id.toString(),
            timestamp: typeof item.timestamp === 'string' ? item.timestamp : item.timestamp.toISOString(),
        })));
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
