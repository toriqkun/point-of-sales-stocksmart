import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { runKMeans } from "@/lib/kmeans";

export async function POST(request: Request) {
  try {
    const ownerId = request.headers.get("x-owner-id");
    if (!ownerId) {
      return NextResponse.json({ error: "Owner ID required" }, { status: 400 });
    }

    // 1. Fetch sales aggregation per product, filtered by ownerId in transaction
    const stats = await prisma.transactionItem.groupBy({
      where: {
        transaction: {
          ownerId: parseInt(ownerId)
        }
      },
      by: ["productId"],
      _sum: {
        quantity: true,
        subtotal: true,
      },
      _count: {
        transactionId: true,
      },
    });

    if (stats.length < 3) {
      return NextResponse.json({ 
        error: "Data pesanan tidak mencukupi untuk analisis K-Means. Minimal harus ada transaksi untuk 3 produk berbeda." 
      }, { status: 400 });
    }

    // 2. Format data for K-Means
    const dataPoints = stats.map(s => ({
      id: s.productId, // temp ID
      productId: s.productId,
      qty: s._sum.quantity || 0,
      revenue: s._sum.subtotal || 0,
      frequency: s._count.transactionId || 0,
    }));

    // 3. Run K-Means
    const results = runKMeans(dataPoints, 3);

    // 4. Update product clusters in database (only for products belonging to this owner)
    await Promise.all(
      results.map(res => 
        prisma.product.updateMany({
          where: { 
            id: res.productId,
            ownerId: parseInt(ownerId)
          },
          data: { cluster: res.cluster }
        })
      )
    );

    return NextResponse.json({ message: "Clustering completed", results });
  } catch (error) {
    console.error("Analysis failed:", error);
    return NextResponse.json({ error: "Failed to run analysis" }, { status: 500 });
  }
}
