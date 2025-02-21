import { prisma } from "@/prisma";
import Post from "./Post";
import { Prisma } from "@prisma/client";
import { auth } from "@clerk/nextjs/server";
import InfiniteFeed from "./InfiniteFeed";

const Feed = async ({ userProfileId }: { userProfileId?: string }) => {
  const { userId } = await auth();
  if (!userId) return null;
  const whereCondition: Prisma.PostWhereInput = userProfileId
    ? { parentPostId: null, userId: userProfileId }
    : {
        parentPostId: null,
        userId: {
          in: [
            userId,
            ...(
              await prisma.follow.findMany({
                where: { followerId: userId },
                select: { followingId: true },
              })
            ).map((f) => f.followingId),
          ],
        },
      };

  const posts = await prisma.post.findMany({
    where: whereCondition,
    include: {
      user: {
        select: {
          username: true,
          displayName: true,
          img: true,
        },
      },
      rePost: {
        include: {
          user: {
            select: { displayName: true, username: true, img: true },
          },
          _count: { select: { likes: true, comments: true, rePosts: true } },
          likes: { where: { userId }, select: { id: true } },
          rePosts: { where: { userId }, select: { id: true } },
          saves: { where: { userId }, select: { id: true } },
        },
      },
      _count: { select: { likes: true, comments: true, rePosts: true } },
      likes: { where: { userId }, select: { id: true } },
      rePosts: { where: { userId }, select: { id: true } },
      saves: { where: { userId }, select: { id: true } },
    },
    take: 3,
    skip: 0,
    orderBy: { createdAt: "desc" },
  });

  console.log(posts);

  // FETCH POSTS FROM CURRENT USER AND FOLLOWİNG USERS

  return (
    <div className="">
      {posts.map((post) => (
        <div className="" key={post.id}>

          <Post post={post} />
        </div>
      ))}
      <InfiniteFeed />
    </div>
  );
};

export default Feed;
