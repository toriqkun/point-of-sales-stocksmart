import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { startOfDay, endOfDay, parseISO } from "date-fns";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("start");
  const endDate = searchParams.get("end");
  const ownerId = request.headers.get("x-owner-id");

  if (!ownerId) {
    return NextResponse.json({ error: "Owner ID required" }, { status: 400 });
  }

  try {
    let where: any = {
      ownerId: parseInt(ownerId)
    };

    if (startDate && endDate) {
      where.createdAt = {
        gte: startOfDay(parseISO(startDate)),
        lte: endOfDay(parseISO(endDate)),
      };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Flatten for easy display or export
    const reportData = transactions.map(t => ({
      id: t.id,
      date: t.createdAt,
      totalPrice: t.totalPrice,
      itemsCount: t.items.length,
      itemDetails: t.items.map(i => `${i.product.name} (${i.quantity})`).join(", ")
    }));

    return NextResponse.json(reportData);
  } catch (error) {
    console.error("Report fetch failed:", error);
    return NextResponse.json({ error: "Failed to fetch report" }, { status: 500 });
  }
}
