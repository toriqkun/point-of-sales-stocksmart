import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ownerId = request.headers.get("x-owner-id");
    if (!ownerId) return NextResponse.json({ error: "Owner ID required" }, { status: 400 });

    const { id } = await params;
    const product = await prisma.product.findFirst({
      where: { 
        id: parseInt(id),
        ownerId: parseInt(ownerId)
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found or access denied" }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ownerId = request.headers.get("x-owner-id");
    if (!ownerId) return NextResponse.json({ error: "Owner ID required" }, { status: 400 });

    const { id } = await params;
    const body = await request.json();
    const { name, price, stock } = body;

    const product = await prisma.product.updateMany({
      where: { 
        id: parseInt(id),
        ownerId: parseInt(ownerId)
      },
      data: {
        name,
        image: body.image,
        price: price ? parseFloat(price) : undefined,
        stock: stock !== undefined ? parseInt(stock) : undefined,
      },
    });

    if (product.count === 0) {
      return NextResponse.json({ error: "Product not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product updated" });
  } catch (error) {
    console.error("Update error:", error);
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ownerId = request.headers.get("x-owner-id");
    if (!ownerId) return NextResponse.json({ error: "Owner ID required" }, { status: 400 });

    const { id } = await params;
    const deleteResult = await prisma.product.deleteMany({
      where: { 
        id: parseInt(id),
        ownerId: parseInt(ownerId)
      },
    });

    if (deleteResult.count === 0) {
      return NextResponse.json({ error: "Product not found or access denied" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted" });
  } catch (error) {
    console.error("Delete error:", error);
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
  }
}
