import { fetchUserPosts } from "@/lib/actions/user.actions";
import ThreadCard from "../cards/ThreadCard";
import { fetchCommunityPosts } from "@/lib/actions/community.actions";
import { getActivity } from "@/lib/actions/user.actions";
import Link from "next/link";
import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchUser} from "@/lib/actions/user.actions";
import { fetchCommunities } from "@/lib/actions/community.actions";
import { Button } from "../ui/button";

interface User {
    accountId :string;
    authUserid :string;
    name  :string;
    username :string;
    imgUrl :string;
    bio :string ;
    type?: 'User' | 'Community';
}

export const ProfileHeader = ({accountId ,authUserid ,name, username, imgUrl, bio, type
} : User) => {
    return (
        <div className="flex w-full flex-col justify-start">
            <div className="flex ,items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="relative h-20 w-20 object-cover">
                        <Image src ={imgUrl}
                        alt = "profile pic"  
                        fill
                        className="rounded-full object-cover shadow-2xl" /> 
                    </div>
                    <div className="flex-1">
                        <h2 className="text-left text-heading3-bold text-primary_text">{name}</h2>
                        <p className="text-base-medium text-gray-1">@{username}</p>
                    </div> 
                </div>
            </div>

                <p className="mt-6 max-w-lg text-base-regular text-primary_text ">{bio}</p>
                <div className="mt-12 h-0.5 w-full bg-color3"></div>
      
      </div>
    )
}

interface Props {
    currentUserId: string ;
    accountId: string ;
    accountType: string ;
}

export const ThreadsTab = async ({ currentUserId,accountId,accountType} : Props) => {
    let result : any; 
    if (accountType === 'Community') {
        result = await fetchCommunityPosts(accountId) ;
    }
    else {
        result = await fetchUserPosts(accountId);
    }
 
    return (
        <section className="mt-9 flex flex-col gap-10"> 
        {
            result.threads.map((thread : any) => (
                <ThreadCard 
                    key={thread._id}
                    id={thread._id}
                    currentUserId={currentUserId || ""}
                    parentId={thread.parentId}
                    content={thread.text}
                    author={accountType === 'User' ?
                        { name: result.name, image: result.image, id: result.id }
                        : { name: thread.author.name, image: thread.author.image, id: thread.author.id }}
                    community={thread.community}
                    createdAt={thread.createdAt}
                    comments={thread.children}
                    likes={thread.likes}
                    title={thread?.title}
                    image_url={thread?.image_url}
                />
            )
        )
        }   
        </section>
    )
}

export const RepliesTab = async ({ currentUserId,accountId,accountType} : Props) => {
    const replay = await getActivity(accountId);
    if (!replay) {
        console.log("Loading replay")
    }
    return (
        <section className="mt-9 flex flex-col gap-10"> 
        {
           <>
              {replay.map((replay) => (
                <Link key={replay._id} href={`/thread/${replay.parentId}`}>
                  <article className="flex items-center gap-2 rounded-md bg-color2 px-7 py-4">
                    <Image
                      src={replay.author.image}
                      alt="Profile Pic"
                      width={22}
                      height={22}
                      className="rounded-full object-cover"
                    />
                    <p className="!text-small-regular text-primary_text">
                      <span className="mr-1 text-secondary-500">
                        {replay.author.username}
                      </span>{" "}
                      replied to your thread
                    </p>
                  </article>
                </Link>
              ))}
            </>
        }
             
        </section>

    )
}

export const CommunityTab = async () => {
  const user = await currentUser();
  if (!user) return null;
  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarding");
  const result = await fetchCommunities({
      searchString : '' ,
      pageNumber :1 ,
      pageSize : 25 ,       
  })

  return (
      <section className=" mt-9 flex flex-col gap-10"> 
      
          {result.communities.length === 0 ? 
          (<p className="text-center !text-base-regular text-primary_text">Not Have any Communities....</p>) : (
              <>
                  {
                      result.communities.map((community) => (
                      <article className='w-full rounded-lg bg-color2 px-7 pr-3 py-2 '>
                          <div className='flex flex-warp justify-between items-center '>
                          <div className="flex items-center gap-4">
                            <Link href={`/communities/${community.id}`} className='relative h-6 w-6'>
                              <Image
                                src={community.image}
                                alt='logo'
                                fill
                                className='rounded-full object-cover'
                              />
                             </Link>
                              <Link href={`/communities/${community.id}`}>
                                <h4 className='text-base-semibold text-theme_text'>{community.name}</h4>
                              </Link>
                            </div>
                             <Link href={`/communities/${community.id}`}>
                              <Button size='sm' className='rounded-lg bg-theme_text 0 px-5 py-1.5 text-small-regular !text-color1 !important'>
                                View
                              </Button>
                            </Link>
                          </div>
                        </article>
                      ))
                  }
              </>
          )}

      </section>

  )
}