import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const ownerId = request.headers.get("x-owner-id");
    if (!ownerId) return NextResponse.json({ error: "Owner ID required" }, { status: 400 });

    const { id: idString } = await params;
    const id = parseInt(idString);

    // Proteksi: Tidak boleh menghapus user dengan role 'owner'
    // Dan hanya boleh menghapus user yang dikelola oleh owner ini
    const deleteResult = await prisma.user.deleteMany({
      where: { 
        id,
        ownerId: parseInt(ownerId),
        role: "kasir" // Tambahan proteksi hanya menghapus kasir
      },
    });

    if (deleteResult.count === 0) {
      return NextResponse.json({ error: "User tidak ditemukan atau Anda tidak memiliki akses" }, { status: 404 });
    }
    
    return NextResponse.json({ message: "User berhasil dihapus" });
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Gagal menghapus user" }, { status: 500 });
  }
}
