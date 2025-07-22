
"use server";

import { revalidatePath } from "next/cache";
import { connectToDatabase } from "@/lib/mongodb";
import type { User, PointHistory, PointHistoryWithUser } from "@/types";
import { Collection, ObjectId } from "mongodb";

// --- In-memory data for when DB is not connected ---
let memoryUsers: User[] = [
    { id: '1', name: 'Charlie', points: 200, avatarUrl: 'https://placehold.co/100x100.png' },
    { id: '2', name: 'Jane', points: 195, avatarUrl: 'https://placehold.co/100x100.png' },
    { id: '3', name: 'Ethan', points: 180, avatarUrl: 'https://placehold.co/100x100.png' },
    { id: '4', name: 'Hannah', points: 165, avatarUrl: 'https://placehold.co/100x100.png' },
    { id: '5', name: 'Alice', points: 150, avatarUrl: 'https://placehold.co/100x100.png' },
    { id: '6', name: 'Bob', points: 120, avatarUrl: 'https://placehold.co/100x100.png' },
    { id: '7', name: 'George', points: 110, avatarUrl: 'https://placehold.co/100x100.png' },
    { id: '8', name: 'Diana', points: 90, avatarUrl: 'https://placehold.co/100x100.png' },
    { id: '9', name: 'Ian', points: 75, avatarUrl: 'https://placehold.co/100x100.png' },
    { id: '10', name: 'Fiona', points: 50, avatarUrl: 'https://placehold.co/100x100.png' },
].sort((a, b) => b.points - a.points);

let memoryHistory: PointHistoryWithUser[] = [];


async function getCollection<T extends Document>(name: string): Promise<Collection<T> | null> {
    try {
        const { db } = await connectToDatabase();
        if (!db) return null;
        return db.collection<T>(name);
    } catch (e) {
        console.warn("Database not connected, using in-memory data.", e);
        return null;
    }
}

export async function getUsers(): Promise<User[]> {
    const usersCollection = await getCollection<User>("users");

    if (!usersCollection) {
        return Promise.resolve(memoryUsers);
    }

    const users = await usersCollection.find({}).sort({ points: -1 }).toArray();

    if (users.length === 0) {
        const initialUsers: Omit<User, 'id'>[] = [
            { name: 'Charlie', points: 200, avatarUrl: 'https://placehold.co/100x100.png' },
            { name: 'Jane', points: 195, avatarUrl: 'https://placehold.co/100x100.png' },
            { name: 'Ethan', points: 180, avatarUrl: 'https://placehold.co/100x100.png' },
            { name: 'Hannah', points: 165, avatarUrl: 'https://placehold.co/100x100.png' },
            { name: 'Alice', points: 150, avatarUrl: 'https://placehold.co/100x100.png' },
            { name: 'Bob', points: 120, avatarUrl: 'https://placehold.co/100x100.png' },
            { name: 'George', points: 110, avatarUrl: 'https://placehold.co/100x100.png' },
            { name: 'Diana', points: 90, avatarUrl: 'https://placehold.co/100x100.png' },
            { name: 'Ian', points: 75, avatarUrl: 'https://placehold.co/100x100.png' },
            { name: 'Fiona', points: 50, avatarUrl: 'https://placehold.co/100x100.png' },
        ];
        await usersCollection.insertMany(initialUsers as any[]);
        return (await usersCollection.find({}).sort({ points: -1 }).toArray()).map(user => ({ ...user, id: user._id.toString() }));
    }

    return users.map(user => ({ ...user, id: user._id.toString() }));
}

export async function addUser(name: string): Promise<User> {
    const usersCollection = await getCollection<User>("users");

    if (!usersCollection) {
        const newUser: User = {
            id: (memoryUsers.length + 1).toString(),
            name,
            points: 0,
            avatarUrl: `https://placehold.co/100x100.png`,
        };
        memoryUsers.push(newUser);
        revalidatePath("/");
        return Promise.resolve(newUser);
    }

    const newUser: Omit<User, 'id'> = {
        name,
        points: 0,
        avatarUrl: `https://placehold.co/100x100.png`,
    };
    const result = await usersCollection.insertOne(newUser as any);
    revalidatePath("/");
    return { ...newUser, id: result.insertedId.toString() };
}

export async function claimPoints(userId: string): Promise<{ updatedUser: User, newTopThree: User[] }> {
    const usersCollection = await getCollection<User>("users");
    const pointsToAdd = Math.floor(Math.random() * 10) + 1;

    if (!usersCollection) {
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
            _id: new ObjectId(),
            userName: updatedUser.name,
            userAvatarUrl: updatedUser.avatarUrl,
            pointsClaimed: pointsToAdd,
            timestamp: new Date()
        });

        memoryUsers.sort((a,b) => b.points - a.points);
        const newTopThree = memoryUsers.slice(0, 3);
        revalidatePath("/");
        return Promise.resolve({ updatedUser, newTopThree });
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
    
    const updatedUser = { ...result, id: result._id.toString() };

    if (historyCollection) {
        await historyCollection.insertOne({
            userId: new ObjectId(userId),
            pointsClaimed: pointsToAdd,
            timestamp: new Date(),
        });
    }

    const newTopThree = await usersCollection.find().sort({ points: -1 }).limit(3).toArray();

    revalidatePath("/");

    return { updatedUser, newTopThree: newTopThree.map(u => ({...u, id: u._id.toString()})) };
}

export async function getPointHistory(): Promise<PointHistoryWithUser[]> {
    const historyCollection = await getCollection<PointHistory>("pointHistory");
    if (!historyCollection) {
        return Promise.resolve(memoryHistory);
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
                userName: "$userDetails.name",
                userAvatarUrl: "$userDetails.avatarUrl"
            }
        }
    ]).toArray();

    return history as PointHistoryWithUser[];
}
