"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "./auth";
import { revalidatePath } from "next/cache";

export async function submitReviewAction(rating: number, comment: string) {
  try {
    const session = await getSession();
    if (!session) {
      return { success: false, message: "Anda harus login untuk memberikan ulasan" };
    }

    const userId = session.id;

    const review = await prisma.review.upsert({
      where: { userId },
      update: {
        rating,
        comment,
      },
      create: {
        userId,
        rating,
        comment,
      },
    });

    revalidatePath("/");
    return { success: true, review };
  } catch (error) {
    console.error("Submit review error:", error);
    return { success: false, message: "Gagal menyimpan ulasan" };
  }
}

export async function getReviewsAction() {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: {
          select: {
            name: true,
            avatarImage: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return { success: true, reviews };
  } catch (error) {
    console.error("Get reviews error:", error);
    return { success: false, message: "Gagal mengambil ulasan" };
  }
}

export async function getUserReviewAction() {
  try {
    const session = await getSession();
    if (!session) return { success: false, message: "Not logged in" };

    const review = await prisma.review.findUnique({
      where: { userId: session.id },
    });

    return { success: true, review };
  } catch (error) {
    return { success: false, message: "Error" };
  }
}
