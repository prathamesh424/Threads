"use server";

import { FilterQuery, SortOrder } from "mongoose";
import { revalidatePath } from "next/cache";
import Community from "../models/community";
import Thread from "../models/thread";
import User from "../models/user";
import  connectDB  from "../db";
import { currentUser } from "@clerk/nextjs/server";

export async function fetchUser(userId: string) {
  try {
    await connectDB();
    const res =  await User.findOne({ id: userId }).populate({
      path: "communities",
      model: Community,
    });
    return res;
  } catch (error: any) {
    console.error(`Failed to fetch user: ${error.message}`);
   }
}

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function updateUser({ userId, bio, name, path, username, image,}: Params): Promise<void> {
  try {
    await connectDB();

    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error: any) {
    console.error(`Failed to create/update user: ${error.message}`);
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchSuggestedUsers() {
  try {
    await connectDB();
     const user = await currentUser();
    if (!user) return null; 
    const users = await User.find({
      id: { $ne: user.id },
      onboarded: true,
    })
    .limit(10)
      .sort({ createdAt: -1 }) 
    
    return users;
  } catch (error: any) {
    console.error(`Failed to fetch Users:  ${error.message}`);
    throw new Error(`Failed to fetch Users: ${error.message}`) ;
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    await connectDB();

    const threads = await User.findOne({ id: userId })
      .populate({
      path: "threads",
      model: Thread,
      options: { sort: { createdAt: -1 } }, 
      populate: [
        {
          path: "community",
          model: Community,
          select: "name id image _id", 
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "name image id", 
          },
        },
      ],
      });
    return threads;
  } catch (error) {
    console.error("Error fetching user threads:", error);
        throw new Error(`Error fetching user threads !!!`);

  }
}

export async function fetchUsers({userId,searchString = "",pageNumber = 1,pageSize = 20,sortBy = "desc",}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    await connectDB();
    const skipAmount = (pageNumber - 1) * pageSize;
    const regex = new RegExp(searchString, "i");
    const query: FilterQuery<typeof User> = {
      id: { $ne: userId },
    };
 
    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } },
        { name: { $regex: regex } },
      ];
    }

    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);
 
    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();
 
    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error) {
    console.error("Error fetching users:", error);
        throw new Error(`Failed to fetch user !!!`);

  }
}

export async function getActivity(userId: string) {
  try {
    connectDB();
    const userThreads = await Thread.find({ author: userId });
    
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId },
    }).populate({
      path: "author",
      model: User,
      select: "name username image _id",
    });

    return replies;
  } catch (error) {
    console.error("Error fetching replies: ", error);
        throw new Error(`Error fetching replies !!!`);

  }
}

