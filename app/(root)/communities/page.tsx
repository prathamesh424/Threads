import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { fetchUser} from "@/lib/actions/user.actions";
import { fetchCommunities } from "@/lib/actions/community.actions";
import CommunityCard from "@/components/cards/CommunityCard";


const Page =async () => {
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
      <section>
          <h1 className="text-heading2-bold text-primary_text mb-10">Organizations</h1>
          <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-9">
            {result.communities.length === 0 ? 
            (<p className="text-center !text-base-regular text-primary_text">You are not part of any Organizations....</p>) : (
                <>
                    {
                        result.communities.map((community) => (
                            <CommunityCard 
                            key={community.id}
                            id={community.id}
                            name={community.name}
                            username = {community.username}
                            imgUrl={community.image}
                            bio={community.bio}
                            members= {community.members}
                            />
                        ))
                    }
                </>
            )}

          </div>
      </section>
    )
}

export default Page