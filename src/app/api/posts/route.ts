import { prisma } from "@/prisma";
import { auth } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const authUser = await auth();
    if (!authUser || !authUser.userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = authUser.userId;
    const searchParams = req.nextUrl.searchParams;
    const userProfileId = searchParams.get("user");
    const page = searchParams.get("cursor") || "1"; // Default to page 1 if not provided
    const LIMIT = 3;

    const whereCondition =
      userProfileId !== "undefined"
        ? { parentPostId: null, userId: userProfileId as string }
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
        user: { select: { username: true, displayName: true, img: true } },
        rePost: {
          include: {
            user: { select: { displayName: true, username: true, img: true } },
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
      take: LIMIT,
      skip: (Number(page) - 1) * LIMIT,
      orderBy: { createdAt: "desc" },
    });

    const totalNumberOfPosts = await prisma.post.count({ where: whereCondition });
    const hasMore = Number(page) * LIMIT < totalNumberOfPosts;

    return NextResponse.json({ posts, hasMore });
  } catch (e) {
    console.error("Error fetching posts:", e);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
