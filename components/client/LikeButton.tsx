'use client';

import { useState, useEffect } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import toast from "react-hot-toast";
import { addLikeToThread } from "@/lib/actions/thread.actions";
import { useAuth } from "@clerk/nextjs";

interface LikeButtonProps {
  likes: number;
  threadId: string;
  authorName: string;
  likesBy?: string[];
  currentUserId : string;
}

const LikeButton = ({ likes, threadId, authorName, likesBy = [] , currentUserId }: LikeButtonProps) => {
  const { userId } = useAuth();
  const [likeCount, setLikeCount] = useState(likes);
  const [liked, setLiked] = useState(userId ? likesBy.includes(currentUserId) : false);

  const handleLike = async () => {
    try {
      const response = await addLikeToThread(threadId);
      if (response.success) {
        if (response.liked) {
          setLiked(response?.liked);
          toast.success(`You liked ${authorName}'s post`);
          setLikeCount(prev => prev + 1);
        } else {
          toast.success(`You unliked ${authorName}'s post`);
          setLikeCount(prev => prev - 1);
          setLiked(false);
        }
      }
    } catch (error) {
      console.error("Error occurred while toggling like:", error);
      toast.error("Failed to update like status. Please try again.");
    }
  };

  return (
    <>
      {liked ? (
        <div className="flex flex-row-reverse">
          <FaHeart
            className='cursor-pointer object-contain text-red-500 ml-1 mt-1 font-bold'
            onClick={handleLike}
          />
          <p className="text-primary_text">{formatLikes(likeCount)}</p>
        </div>
      ) : (
        <div className="flex flex-row-reverse" >
          <FaRegHeart
            className='cursor-pointer object-contain text-gray-500 ml-1 mt-1 font-bold'
            onClick={handleLike}
          />
          {likeCount > 0 && <p className="text-primary_text">{formatLikes(likeCount)}</p>}
        </div>
      )}
    </>
  );

  function formatLikes(likes: number): string {
    if (!likes) {
      return "0";
    }
    const likeValue = likes.valueOf(); 
  
    if (likeValue >= 1_000_000_000) {
      return (likeValue / 1_000_000_000).toFixed(1).replace(/\.0$/, '') + 'B';   
    } else if (likeValue >= 1_000_000) {
      return (likeValue / 1_000_000).toFixed(1).replace(/\.0$/, '') + 'M';   
    } else if (likeValue >= 1_000) {
      return (likeValue / 1_000).toFixed(1).replace(/\.0$/, '') + 'K';     
    } else {
      return likeValue.toString();                             
    }
  }
};

export default LikeButton;