"use server";

import { prisma } from "@/lib/prisma";

export async function getLandingStats() {
  try {
    const ownerCount = await prisma.user.count({
      where: { role: "owner" }
    });
    
    const productCount = await prisma.product.count();
    const transactionCount = await prisma.transaction.count();

    // Get a few recent owners for the avatar list
    const recentOwners = await prisma.user.findMany({
      where: { 
        role: "owner",
        avatarImage: { not: null }
      },
      take: 5,
      select: { avatarImage: true },
      orderBy: { id: "desc" }
    });

    return {
      success: true,
      ownerCount: ownerCount || 0,
      productCount: productCount || 0,
      transactionCount: transactionCount || 0,
      recentAvatars: recentOwners.map((o: { avatarImage: string | null }) => o.avatarImage).filter(Boolean) as string[]
    };
  } catch (error) {
    console.error("Failed to fetch landing stats:", error);
    return {
      success: false,
      ownerCount: 0,
      productCount: 0,
      transactionCount: 0,
      recentAvatars: []
    };
  }
}
