import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const ownerId = request.headers.get("x-owner-id");
    if (!ownerId) {
      return NextResponse.json({ error: "Owner ID required" }, { status: 400 });
    }

    const body = await request.json();
    const { items, totalPrice } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "No items in transaction" }, { status: 400 });
    }

    // Use a transaction to ensure atomic updates
    const transaction = await prisma.$transaction(async (tx) => {
      // 1. Create the transaction record
      const newTransaction = await tx.transaction.create({
        data: {
          totalPrice,
          ownerId: parseInt(ownerId),
          items: {
            create: items.map((item: any) => ({
              productId: item.id,
              quantity: item.quantity,
              subtotal: item.price * item.quantity,
            })),
          },
        },
      });

      // 2. Decrement stock for each product
      for (const item of items) {
        // Double check the product belongs to the same owner
        const product = await tx.product.findUnique({
          where: { id: item.id }
        });

        if (product && product.ownerId === parseInt(ownerId)) {
          await tx.product.update({
            where: { id: item.id },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          });
        }
      }

      return newTransaction;
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    console.error("Transaction failed:", error);
    return NextResponse.json({ error: "Failed to save transaction" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const ownerId = request.headers.get("x-owner-id");
    if (!ownerId) {
      return NextResponse.json({ error: "Owner ID required" }, { status: 400 });
    }

    const transactions = await prisma.transaction.findMany({
      where: { ownerId: parseInt(ownerId) },
      include: {
        items: {
          include: { product: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(transactions);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 500 });
  }
}
