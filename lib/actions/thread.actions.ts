"use server";

import { revalidatePath } from "next/cache";

import  connectDB  from "../db";

import User from "../models/user";
import Thread from "../models/thread";
import Community from "../models/community";
import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function fetchPosts(pageNumber = 1, pageSize = 10) {
  try {
    await connectDB();
  const skipAmount = (pageNumber - 1) * pageSize;
 
  const postsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({
      path: "author",
      model: User,
    })
    .populate({
      path: "community",
      model: Community,
    })
    .populate({
      path: "children", 
      populate: {
        path: "author", 
        model: User,
        select: "_id name parentId image", 
      },
    });
 
  const totalPostsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  });  
  const posts = await postsQuery.exec();
  const isNext = totalPostsCount > skipAmount + posts.length;
  return { posts, isNext };
    
  } catch (error :any) {
    console.error(`Failed to fetch thread !!!: ${error.message}`);
    throw new Error(`Failed to fetch thread !!!`);
  }
}

interface Params {
  text: string,
  author: string,
  communityId: string | null,
  path: string,
  title: string | null,
  image_url:  string | null,
}

export async function createThread({ text, author, communityId, path, title = null, image_url = null }: Params) {
  try {
    await connectDB();
    const communityIdObject = communityId ? await Community.findOne(
      { id: communityId },
      { _id: 1 }
    ) : null;
    const createdThread = await Thread.create({
      text,
      author,
      community: communityIdObject,
      ...(title && { title }),
      ...(image_url && { image_url })
    });

    await User.findByIdAndUpdate(author, {
      $push: { threads: createdThread._id },
    });
    if (communityIdObject) {
      await Community.findByIdAndUpdate(communityIdObject, {
        $push: { threads: createdThread._id },
      });
    }

    revalidatePath(path);
  } catch (error: any) {
    console.error(`Failed to create thread: ${error.message}`);
    throw new Error(`Failed to create thread !!!`);
  }
}

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
  try {
    const childThreads = await Thread.find({ parentId: threadId });

    const descendantThreads = [];
    for (const childThread of childThreads) {
      const descendants = await fetchAllChildThreads(childThread._id);
      descendantThreads.push(childThread, ...descendants);
  }
  return descendantThreads;
  }
  catch (error : any) {
    console.error(`Failed to fetch commits : ${error.message}`);
    throw new Error(`Failed to fetch commits !!!`);
  }
}

export async function deleteThread(id: string, path: string): Promise<void> {
  try {
    await connectDB();
    const mainThread = await Thread.findById(id).populate("author community");
    if (!mainThread) {
      throw new Error("Thread not found");
    }
    const descendantThreads = await fetchAllChildThreads(id);
    const descendantThreadIds = [
      id,
      ...descendantThreads.map((thread) => thread._id),
    ];
    const uniqueAuthorIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.author?._id?.toString()),
        mainThread.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.community?._id?.toString()),
        mainThread.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );


    await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}

export async function fetchThreadById(threadId: string) {
  connectDB();
  try {
    const thread = await Thread.findById(threadId)
      .populate({
        path: "author",
        model: User,
        select: "_id id name image",
      })
      .populate({
        path: "community",
        model: Community,
        select: "_id id name image",
      })
      .populate({
        path: "children",
        populate: [
          {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
          {
            path: "children",
            model: Thread,
            populate: {
              path: "author", 
              model: User,
              select: "_id id name parentId image",
            },
          },
        ],
      })
      .exec();

    return thread;
  } catch (err) {
    console.error("Error while fetching thread:", err);
    throw new Error("Unable to fetch thread");
  }
}

export async function addCommentToThread(threadId: string,commentText: string,userId: string,path: string) {
  try {
    await connectDB();
    const originalThread = await Thread.findById(threadId);

    if (!originalThread) {
      throw new Error("Thread not found");
    }

    const commentThread = new Thread({
      text: commentText,
      author: userId,
      parentId: threadId,
    });

    const savedCommentThread = await commentThread.save();
    originalThread.children.push(savedCommentThread._id);
    await originalThread.save();

    revalidatePath(path);
  } catch (err) {
    console.error("Error while adding comment:", err);
    throw new Error("Unable to add comment");
  }
}


export async function addLikeToThread(threadId: string) {
  await connectDB();  
  try {
    const user = await currentUser();
    if (!user) return { success: false, message: "User not authenticated" };
    
    const existingThread = await Thread.findById(threadId);
    if (!existingThread) {
      throw new Error("Thread not found");
    }
    
    const userLiked = existingThread.likesBy && existingThread.likesBy.includes(user.id);
    
    const updateOperation = userLiked 
      ? { $inc: { likes: -1 }, $pull: { likesBy: user.id } }
      : { $inc: { likes: 1 }, $addToSet: { likesBy: user.id } };
    
    const thread = await Thread.findByIdAndUpdate(
      threadId,
      updateOperation,
      { new: true }
    );
    
    return { 
      success: true, 
      thread,
      liked: !userLiked
    };
  } catch (error : any) {
    console.error("Error while toggling like on the thread", error);
    throw new Error("Failed to toggle like on the thread");
  }
}



// export const correctGrammar = async (text: string): Promise<string> => {
//   const response = await fetch('https://api.languagetoolplus.com/v2/check', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded',
//     },
//     body: new URLSearchParams({
//       text: text,
//       language: 'en-US', // Change language as needed
//     }),
//   });

//   if (!response.ok) {
//     throw new Error('Failed to correct grammar');
//   }
//   console.log(response);
//   const data = await response.json();
//   console.log(data);
//   // Get the corrected text from the response
//   const correctedText = data.matches.reduce((acc: string, match: any) => {
//     return acc.replace(
//       match.context.text,
//       match.replacements.length > 0 ? match.replacements[0].value : match.context.text
//     );
//   }, text);

//   return correctedText;
// };