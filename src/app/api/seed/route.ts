import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // Clear existing data
    await prisma.transactionItem.deleteMany();
    await prisma.transaction.deleteMany();
    await prisma.product.deleteMany();

    // Create a demo owner if not exists
    let owner = await prisma.user.findFirst({ where: { email: "demo@stocksmart.com" } });
    if (!owner) {
      owner = await prisma.user.create({
        data: {
          name: "Demo Owner",
          email: "demo@stocksmart.com",
          password: "password123",
          role: "owner",
          businessName: "Demo Store"
        }
      });
    }

    const ownerId = owner.id;

    // Create products
    const products = await Promise.all([
      prisma.product.create({ data: { name: "Burger Original", price: 15000, stock: 100, ownerId } }),
      prisma.product.create({ data: { name: "Burger Keju", price: 18000, stock: 80, ownerId } }),
      prisma.product.create({ data: { name: "Burger BBQ", price: 20000, stock: 50, ownerId } }),
      prisma.product.create({ data: { name: "Kentang Goreng", price: 12000, stock: 120, ownerId } }),
      prisma.product.create({ data: { name: "Es Teh", price: 5000, stock: 200, ownerId } }),
      prisma.product.create({ data: { name: "Dimsum Keju", price: 15000, stock: 40, ownerId } }),
    ]);

    // Create some transactions to allow K-Means to run
    // Transaction 1: Lots of Burger Keju
    await prisma.transaction.create({
      data: {
        totalPrice: 180000,
        ownerId,
        items: {
          create: [
            { productId: products[1].id, quantity: 10, subtotal: 180000 }
          ]
        }
      }
    });

    // Transaction 2: Misc items
    await prisma.transaction.create({
      data: {
        totalPrice: 47000,
        ownerId,
        items: {
          create: [
            { productId: products[0].id, quantity: 1, subtotal: 15000 },
            { productId: products[3].id, quantity: 2, subtotal: 24000 },
            { productId: products[4].id, quantity: 2, subtotal: 8000 },
          ]
        }
      }
    });

    // Transaction 3: High frequency for Burger Keju
    await prisma.transaction.create({
      data: {
        totalPrice: 36000,
        ownerId,
        items: {
          create: [
            { productId: products[1].id, quantity: 2, subtotal: 36000 }
          ]
        }
      }
    });

    return NextResponse.json({ message: "Database seeded successfully!" });
  } catch (error: any) {
    const fs = require("fs");
    fs.writeFileSync("api_seed_error.log", error.stack || error.message || String(error));
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
