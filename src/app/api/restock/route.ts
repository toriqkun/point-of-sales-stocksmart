import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const ownerId = request.headers.get("x-owner-id");
    if (!ownerId) {
      return NextResponse.json({ error: "Owner ID required" }, { status: 400 });
    }

    const products = await prisma.product.findMany({
      where: {
        ownerId: parseInt(ownerId),
        OR: [
          {
            cluster: "High",
            stock: { lt: 15 },
          },
          {
            cluster: "Medium",
            stock: { lt: 10 },
          },
          {
            stock: { lt: 5 },
          }
        ],
      },
      orderBy: {
        stock: "asc",
      },
    });

    const alerts = products.map((p: any) => ({
      id: p.id,
      name: p.name,
      stock: p.stock,
      cluster: p.cluster,
      priority: p.cluster === "High" ? "Urgent" : p.cluster === "Medium" ? "Medium" : "Low",
      message: p.cluster === "High" 
        ? "Produk terlaris! Stok kritis, segera beli." 
        : p.cluster === "Medium"
        ? "Produk populer, stok mulai menipis."
        : "Stok hampir habis.",
    }));

    return NextResponse.json(alerts);
  } catch (error) {
    console.error("Restock alert error:", error);
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 });
  }
}
