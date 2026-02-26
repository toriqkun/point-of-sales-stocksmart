"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

export async function loginAction(email: string, password: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        email: email,
      },
      include: {
        owner: true // Ambil data owner jika dia kasir
      }
    });

    if (!user) {
      return { success: false, message: "Email atau password salah" };
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return { success: false, message: "Email atau password salah" };
    }

    // Tentukan ownerId dan businessName
    const effectiveOwnerId = user.role === "owner" ? user.id : user.ownerId;
    const effectiveBusinessName = user.role === "owner" ? user.businessName : user.owner?.businessName;

    return { 
        success: true, 
        user: { 
            id: user.id, 
            name: user.name, 
            email: user.email, 
            role: user.role,
            avatarImage: user.avatarImage,
            businessName: effectiveBusinessName,
            ownerId: effectiveOwnerId
        } 
    };
  } catch (error) {
    console.error("Login error:", error);
    return { success: false, message: "Terjadi kesalahan pada server" };
  }
}

export async function registerAction(data: { name: string; email: string; password: string; businessName: string }) {
  try {
    // Cek apakah email sudah terdaftar
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email }
    });

    if (existingUser) {
      return { success: false, message: "Email sudah terdaftar" };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        password: hashedPassword,
        businessName: data.businessName,
        role: "owner", // Pendaftaran default sebagai owner
      }
    });

    return { 
      success: true, 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email, 
        role: user.role,
        businessName: user.businessName,
        ownerId: user.id // Owner baru kodenya adalah id dia sendiri
      } 
    };
  } catch (error) {
    console.error("Register error:", error);
    return { success: false, message: "Gagal melakukan pendaftaran" };
  }
}

export async function updateProfileAction(userId: number, data: { name?: string; avatarImage?: string; businessName?: string }) {
  try {
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: data.name,
        avatarImage: data.avatarImage,
        businessName: data.businessName,
      },
      include: {
        owner: true
      }
    });

    const effectiveOwnerId = updatedUser.role === "owner" ? updatedUser.id : updatedUser.ownerId;
    const effectiveBusinessName = updatedUser.role === "owner" ? updatedUser.businessName : updatedUser.owner?.businessName;

    return {
      success: true,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        avatarImage: updatedUser.avatarImage,
        businessName: effectiveBusinessName,
        ownerId: effectiveOwnerId
      },
    };
  } catch (error) {
    console.error("Profile update error:", error);
    return { success: false, message: "Gagal memperbarui profil" };
  }
}
