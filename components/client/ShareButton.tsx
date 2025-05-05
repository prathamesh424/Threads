"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";
import { FaSquareShareNodes } from "react-icons/fa6";
 
interface ShareButtonProps {
  threadId: string;
}

const ShareButton = ({ threadId }: ShareButtonProps) => {
  const [showPopup, setShowPopup] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);

  const shareLink =
    typeof window !== "undefined"
      ? `${window.location.origin}/thread/${threadId}`
      : "";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 1500);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  return (
    <div className="relative">
      <button onClick={() => setShowPopup(true)}>
        {/* <FaSquareShareNodes
          className="cursor-pointer object-contain text-gray-500 ml-1 mt-1 font-bold"
        /> */}
         <Image
                  src='/images/share.svg'
                  alt='share'
                  width={24}
                  height={24}
                  className='cursor-pointer object-contain '
                />
      </button>

      {showPopup && (
        <div className="absolute top-10 right-0 w-64 rounded-lg bg-color1 border border-gray-600 p-4 shadow-xl z-50">
          <p className="text-white text-sm mb-2">Share this thread</p>
          <input
            type="text"
            value={shareLink}
            readOnly
            className="w-full rounded bg-gray-800 text-white px-2 py-1 text-xs mb-2"
          />
          <button
            onClick={handleCopy}
            className="w-full bg-purple-500 hover:bg-purple-600 text-white py-1 text-sm rounded"
          >
            {copySuccess ? "Link Copied!" : "Copy Link"}
          </button>
          <button
            className="absolute top-1 right-2 text-gray-400 hover:text-white text-sm"
            onClick={() => setShowPopup(false)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default ShareButton;
