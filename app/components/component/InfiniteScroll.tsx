// "use client";

// import { useEffect, useState } from "react";
// import { useInView } from "react-intersection-observer";
// import { fetchPosts } from "@/lib/actions/thread.actions";
// import ThreadCard from "@/components/cards/ThreadCard";

// export default function InfiniteScroll({ initialPosts, userId }) {
//   const [posts, setPosts] = useState(initialPosts.posts);
//   const [page, setPage] = useState(1);
//   const [hasMore, setHasMore] = useState(initialPosts.isNext);
//   const [isLoading, setIsLoading] = useState(false);

//   const { ref, inView } = useInView({
//     threshold: 0.5,
//   });

//   const loadMorePosts = async () => {
//     if (isLoading || !hasMore) return;
    
//     setIsLoading(true);
//     const nextPage = page + 1;
    
//     try {
//       const newPosts = await fetchPosts(nextPage, 30);
      
//       setPage(nextPage);
//       setPosts((prevPosts) => [...prevPosts, ...newPosts.posts]);
//       setHasMore(newPosts.isNext);
//     } catch (error) {
//       console.error("Error loading more posts:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (inView) {
//       loadMorePosts();
//     }
//   }, [inView]);

//   return (
//     <section className="mt-9 flex flex-col gap-10">
//       {posts.length === 0 ? (
//         <p className="text-center !text-base-regular text-primary_text">
//           No threads found
//         </p>
//       ) : (
//         <>
//           {posts.map((post) => (
//             <ThreadCard
//               key={post._id}
//               id={post._id}
//               currentUserId={userId}
//               parentId={post.parentId}
//               content={post.text}
//               author={post.author}
//               community={post.community}
//               createdAt={post.createdAt}
//               comments={post.children}
//               likes={post.likes}
//               title={post.title}
//               image_url={post.image_url}
//               likesBy={post?.likesBy}
//             />
//           ))}
//         </>
//       )}
      
//       {hasMore && (
//         <div ref={ref} className="flex justify-center py-5">
//           <div className="loading-spinner w-6 h-6 border-t-2 border-primary_text rounded-full animate-spin"></div>
//         </div>
//       )}
//     </section>
//   );
// } 