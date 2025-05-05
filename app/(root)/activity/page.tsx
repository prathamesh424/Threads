import { currentUser } from "@clerk/nextjs/server"; 
import { redirect } from "next/navigation";
 import { fetchUser, getActivity } from "@/lib/actions/user.actions";
import Image from "next/image";
 import Link from "next/link";
import toast from "react-hot-toast";  

const Page = async () => {
  try {
    const user = await currentUser();
    if (!user) return null;

    const userInfo = await fetchUser(user.id);
    if (!userInfo?.onboarded) {
      redirect("/onboarding");
    }

     const activity = await getActivity(userInfo._id);

    return (
      <section>
        <h1 className="text-heading2-bold text-primary_text mb-10">Activity</h1>
        <section className="mt-10 flex flex-col gap-5">
          {activity.length > 0 ? (
            <>
              {activity.map((activity) => (
                <Link key={activity._id} href={`/thread/${activity.parentId}`}>
                  <article className="flex items-center gap-2 rounded-md bg-color2 px-7 py-4">
                    <Image
                      src={activity.author.image}
                      alt="Profile Pic"
                      width={22}
                      height={22}
                      className="rounded-full object-cover"
                    />
                    <p className="!text-small-regular text-primary_text">
                      <span className="mr-1 text-primary-500">
                        {activity.author.username}
                      </span>{" "}
                      replied to your thread
                    </p>
                  </article>
                </Link>
              ))}
            </>
          ) : (
            <p className="!text-base-regular text-light-3">No Activity yet</p>
          )}
        </section>
      </section>
    );
  } catch (error) {
    console.error("Error loading page:", error);
    toast.error(
      "Failed to load page data. Please try again later."
    );
    return (
      <section>
        <h1 className="text-heading2-bold text-primary_text mb-10">Activity</h1>
        <p className="!text-base-regular text-light-3">An error occurred while loading activity.</p>
      </section>
    );
  }
};

export default Page;
