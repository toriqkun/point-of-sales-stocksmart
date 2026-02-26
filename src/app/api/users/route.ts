import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcrypt";

export async function GET(request: Request) {
  try {
    const ownerId = request.headers.get("x-owner-id");
    if (!ownerId) {
      return NextResponse.json({ error: "Owner ID required" }, { status: 400 });
    }

    const users = await prisma.user.findMany({
      where: {
        OR: [
          { id: parseInt(ownerId) },
          { ownerId: parseInt(ownerId) }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatarImage: true,
      },
      orderBy: { id: "asc" },
    });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const ownerId = request.headers.get("x-owner-id");
    if (!ownerId) {
      return NextResponse.json({ error: "Owner ID required" }, { status: 400 });
    }

    const body = await request.json();
    const { name, email, password, role } = body;

    if (!name || !email || !password || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role,
        ownerId: parseInt(ownerId)
      },
    });

    return NextResponse.json({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
    }, { status: 201 });
  } catch (error) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
  }
}
