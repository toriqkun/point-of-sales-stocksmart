import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  try {
    const { transactionId: rawTransactionId } = await params;
    const { searchParams } = new URL(request.url);
    const ownerId = searchParams.get("ownerId");

    if (!ownerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const transactionId = parseInt(rawTransactionId);

    const transaction = await prisma.transaction.findUnique({
      where: { 
        id: transactionId,
      },
      include: {
        owner: true,
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!transaction) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    // Security check: Ensure the transaction belongs to the requesting owner
    if (transaction.ownerId !== parseInt(ownerId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(transaction);
  } catch (error) {
    console.error("Print API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
