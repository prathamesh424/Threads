import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchUser } from "@/lib/actions/user.actions";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Image from "next/image";
import {ProfileHeader ,ThreadsTab , RepliesTab , CommunityTab} from "@/components/component/ProfileTabs";

const Page = async ({params} : {params : { id: string}}) => {
    const user = await currentUser();
    if (!user) return null;
    const userInfo = await fetchUser(params.id);
    if (!userInfo?.onboarded) redirect("/onboarding");

    const profileTabs = [
    { value: "threads", label: "Threads", icon: "/images/reply.svg" },
    { value: "replies", label: "Replies", icon: "/images/members.svg" },
    { value: "communities", label: "Communities", icon: "/images/tag.svg" },
  ];
    return(
        <section className="text-primary_text">
                 <ProfileHeader
                   accountId={userInfo.id}
                   authUserid={user.id}
                   name={userInfo.name}
                   username={userInfo.username}
                   imgUrl={userInfo.image}
                   bio={userInfo.bio}
                />

                <div className="mt-9">
                    <Tabs defaultValue="threads" className="w-full">
                        <TabsList className="tab">
                            {profileTabs.map((tab) =>(
                                <TabsTrigger key={tab.label} value={tab.value} className="tab">
                                    <Image
                                        src={tab.icon}
                                        alt={tab.label}
                                        width={24}
                                        height={24}  
                                        className="object-contain" 
                                    />

                                    <p className="max-sm:hidden">{tab.label}</p>
                                    {
                                        tab.label ==='Threads' && (
                                            <p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium to-light-2">
                                                {userInfo?.threads?.length}
                                            </p>
                                        )
                                    }
                                </TabsTrigger>
                            ))}
                        </TabsList>

                        { profileTabs.map((tab) => (
                            <TabsContent
                                key={`content-${tab.value}`}
                                value={tab.value}
                                className="w-full text-primary_text">
                                
                                {tab.value === "threads" ?
                                <ThreadsTab
                                    currentUserId= {user.id}
                                    accountId= {userInfo.id}
                                    accountType="User"
                                    /> 
                                :
                                    tab.value === "replies" ?
                                <RepliesTab
                                    currentUserId= {user.id}
                                    accountId= {userInfo._id}
                                    accountType="User"
                                        /> 
                                :
                                <CommunityTab/>
                            }
                            </TabsContent>
                        ))}
                    </Tabs>
                </div>
          </section>
    )
}


export default Page;