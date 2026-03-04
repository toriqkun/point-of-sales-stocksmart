import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { startOfDay, startOfMonth, endOfDay, endOfMonth } from "date-fns";

export async function GET(request: Request) {
  try {
    const ownerId = request.headers.get("x-owner-id");
    if (!ownerId) {
      return NextResponse.json({ error: "Owner ID required" }, { status: 400 });
    }

    const oId = parseInt(ownerId);
    const now = new Date();
    
    // 1. Sales today
    const salesToday = await prisma.transaction.findMany({
      where: {
        ownerId: oId,
        createdAt: {
          gte: startOfDay(now),
          lte: endOfDay(now),
        },
      },
      include: {
        items: true
      }
    });

    const totalSalesToday = salesToday.reduce((sum, t) => sum + t.totalPrice, 0);
    const totalProfitToday = salesToday.reduce((sum, t) => {
      const transactionProfit = t.items.reduce((itemSum, item) => itemSum + (item.subtotal - (item.purchasePrice * item.quantity)), 0);
      return sum + transactionProfit;
    }, 0);

    // 2. Sales this month
    const salesMonth = await prisma.transaction.findMany({
      where: {
        ownerId: oId,
        createdAt: {
          gte: startOfMonth(now),
          lte: endOfMonth(now),
        },
      },
      include: {
        items: true
      }
    });

    const totalSalesMonth = salesMonth.reduce((sum, t) => sum + t.totalPrice, 0);
    const totalProfitMonth = salesMonth.reduce((sum, t) => {
      const transactionProfit = t.items.reduce((itemSum, item) => itemSum + (item.subtotal - (item.purchasePrice * item.quantity)), 0);
      return sum + transactionProfit;
    }, 0);

    // 3. Total products
    const totalProducts = await prisma.product.count({
      where: { ownerId: oId }
    });

    // 4. Best selling products (top 5)
    const bestSellingItems = await prisma.transactionItem.groupBy({
      where: {
        transaction: {
          ownerId: oId
        }
      },
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const products = await prisma.product.findMany({
      where: {
        id: { in: bestSellingItems.map((item: { productId: number }) => item.productId) },
        ownerId: oId
      }
    });

    const topProducts = bestSellingItems.map((item: { productId: number; _sum: { quantity: number | null } }) => {
      const product = products.find((p: { id: number; name: string }) => p.id === item.productId);
      return {
        name: product?.name || "Unknown",
        totalSold: item._sum.quantity || 0,
      };
    });

    // 5. Cluster distribution
    const clusterDist = await prisma.product.groupBy({
      where: { ownerId: oId },
      by: ["cluster"],
      _count: { id: true },
    });

    return NextResponse.json({
      todaySales: totalSalesToday || 0,
      todayProfit: totalProfitToday || 0,
      monthSales: totalSalesMonth || 0,
      monthProfit: totalProfitMonth || 0,
      totalProducts,
      topProducts,
      clusterDist: clusterDist.reduce((acc: any, curr: { cluster: string | null; _count: { id: number } }) => {
        acc[curr.cluster || "unassigned"] = curr._count.id;
        return acc;
      }, {}),
    });
  } catch (error) {
    console.error("Dashboard stats failed:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
