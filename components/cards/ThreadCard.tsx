import Image from "next/image";
import Link from "next/link";
import { formatDateString } from "@/lib/utils";
import DeleteThread from "../forms/DeleteThread";
import { FaRegCommentDots } from "react-icons/fa";
import LikeButton from "../client/LikeButton";
import { serializeData } from "@/lib/utils/serialize";
import ShareButton from "../client/ShareButton";
import { FaRegShareSquare } from "react-icons/fa";
 
interface Props {
  id: string;
  currentUserId: string;
  parentId: string | null;
  content: string;
  author: {
    name: string;
    image: string;
    id: string;
  };
  community: {
    id: string;
    name: string;
    image: string;
  } | null;
  createdAt: string;
  comments: {
    author: {
      image: string;
    };
  }[];
  isComment?: boolean;
  likes: number;
  title: string;
  image_url: string;
  likesBy?: string[];
}

async function ThreadCard({
  id,
  currentUserId,
  parentId,
  content,
  author,
  community,
  createdAt,
  comments,
  isComment,
  likes,
  title, 
  image_url,
  likesBy
}: Props) {



  var isUrl = null;

  if (image_url != null)
    isUrl = image_url;

  const serializedAuthor = serializeData(author);

  return (
    <article
      className={`flex w-full flex-col rounded-xl ${
        isComment ? "px-0 xs:px-7" : "bg-color2  p-7"
      }`}
    >
      <div className='flex items-start justify-between'>
        <div className='flex w-full flex-1 flex-row gap-4'>
          <div className='flex flex-col items-center'>
            <Link href={`/profile/${author.id}`} className='relative h-11 w-11'>
              <Image
                src={author.image}
                alt='user_community_image'
                fill
                className='cursor-pointer rounded-full'
              />
            </Link>
            <div className='relative mt-2 w-0.5 grow rounded-full bg-neutral-800' />
          </div>

          <div className='flex w-full flex-col'>
            <Link href={`/profile/${author.id}`} className='w-fit'>
              <h4 className='cursor-pointer text-base-semibold text-purple-400'>
                {author.name}
              </h4>
            </Link>
            <img src={image_url} alt="" className="rounded-lg" />
            <h1 className="text-secondary-500 text-heading4-bold mt-2 font-extrabold font-serif ">{title}</h1>
            <p className='mt-2 text-small-regular text-primary_text'>{content}</p>
            

            <div className={`${isComment && "mb-10"} mt-5 flex flex-col gap-3`}>
              <div className='flex gap-3.5'>
                <LikeButton 
                  likes={Number(likes)} 
                  threadId={id.toString()} 
                  authorName={serializedAuthor.name}
                  currentUserId={currentUserId}
                  likesBy={likesBy || []}
                />
                
                <Link href={`/thread/${id}`}>
                  {/* <FaRegCommentDots
                    className='cursor-pointer object-contain text-gray-500 ml-1 mt-1 font-bold'
                  /> */}
                     <Image
                    src='/images/reply.svg'
                    alt='commit'
                    width={24}
                    height={24}
                    className='cursor-pointer object-contain '
                  />
                </Link>
                {/* <FaRegShareSquare
                  className='cursor-pointer object-contain text-gray-500 ml-1 mt-1 font-bold'
                /> */}
                <Image
                  src='/images/repost.svg'
                  alt='forward'
                  width={24}
                  height={24}
                  className='cursor-pointer object-contain mb-1'
                />

                <ShareButton threadId={id}/>
              </div>

              {isComment && comments.length > 0 && (
                <Link href={`/thread/${id}`}>
                  <p className='mt-1 text-subtle-medium text-gray-1'>
                    {comments.length} repl{comments.length > 1 ? "ies" : "y"}
                  </p>
                </Link>
              )}
            </div>
          </div>
        </div>

        <DeleteThread
          threadId={JSON.stringify(id)}
          currentUserId={currentUserId}
          authorId={author.id}
          parentId={parentId}
          isComment={isComment}
        />
      </div>

      {!isComment && comments.length > 0 && (
        <div className='ml-1 mt-3 flex items-center gap-2'>
          {comments.slice(0, 2).map((comment, index) => (
            <Image
              key={index}
              src={comment.author.image}
              alt={`user_${index}`}
              width={24}
              height={24}
              className={`${index !== 0 && "-ml-5"} rounded-full object-cover`}
            />
          ))}

          <Link href={`/thread/${id}`}>
            <p className='mt-1 text-subtle-medium text-gray-1'>
              {comments.length} repl{comments.length > 1 ? "ies" : "y"}
            </p>
          </Link>
        </div>
      )}

      {!isComment && community && (
        <Link
          href={`/communities/${community.id}`}
          className='mt-5 flex items-center'
        >
          <p className='text-subtle-medium text-gray-1'>
            {formatDateString(createdAt)}
            {community && ` - ${community.name} Community`}
          </p>

          <Image
            src={community.image}
            alt={community.name}
            width={14}
            height={14}
            className='ml-1 rounded-full object-cover'
          />
        </Link>
      )}
    </article>
  );
}

export default ThreadCard;