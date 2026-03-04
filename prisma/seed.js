require("dotenv").config();
const { PrismaClient } = require("@prisma/client");
const { PrismaPg } = require("@prisma/adapter-pg");
const { Pool } = require("pg");
const bcrypt = require("bcrypt");

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);
  
  // Clean up
  await prisma.review.deleteMany();
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.updateMany({ data: { ownerId: null } });
  await prisma.user.deleteMany();

  // Create Owner
  const owner = await prisma.user.create({
    data: {
      name: "Owner Edam Burger",
      email: "edam@owner.com",
      password: hashedPassword,
      role: "owner",
    },
  });

  // Create Products tied to the Owner
  const products = await prisma.$transaction([
    prisma.product.create({ 
      data: { 
        name: "Burger Original", 
        price: 15000, 
        purchasePrice: 10000, 
        stock: 50, 
        ownerId: owner.id 
      } 
    }),
    prisma.product.create({ 
      data: { 
        name: "Burger Keju", 
        price: 18000, 
        purchasePrice: 12500, 
        stock: 45, 
        ownerId: owner.id 
      } 
    }),
    prisma.product.create({ 
      data: { 
        name: "Burger Special", 
        price: 25000, 
        purchasePrice: 18000, 
        stock: 30, 
        ownerId: owner.id 
      } 
    }),
    prisma.product.create({ 
      data: { 
        name: "French Fries", 
        price: 12000, 
        purchasePrice: 7000, 
        stock: 60, 
        ownerId: owner.id 
      } 
    }),
    prisma.product.create({ 
      data: { 
        name: "Iced Tea", 
        price: 5000, 
        purchasePrice: 2000, 
        stock: 100, 
        ownerId: owner.id 
      } 
    }),
  ]);

  // Create multiple users for reviews
  const user1 = await prisma.user.create({
    data: {
      name: "Budi Sentosa",
      email: "budi@owner.com",
      password: hashedPassword,
      role: "owner",
      avatarImage: "https://i.pravatar.cc/150?img=11"
    }
  });

  const user2 = await prisma.user.create({
    data: {
      name: "Andi Pratama",
      email: "andi@kasir.com",
      password: hashedPassword,
      role: "kasir",
      avatarImage: "https://i.pravatar.cc/150?img=12"
    }
  });

  const user3 = await prisma.user.create({
    data: {
      name: "Siti Aminah",
      email: "siti@owner.com",
      password: hashedPassword,
      role: "owner",
      avatarImage: "https://i.pravatar.cc/150?img=5"
    }
  });

  const user4 = await prisma.user.create({
    data: {
      name: "Dewi Lestari",
      email: "dewi@kasir.com",
      password: hashedPassword,
      role: "kasir",
      avatarImage: "https://i.pravatar.cc/150?img=9"
    }
  });

  // Create professional reviews
  await prisma.review.createMany({
    data: [
      {
        userId: user1.id,
        rating: 5,
        comment: "Fitur HPP-nya benar-benar menyelamatkan bisnis saya! Sekarang saya bisa tahu persis berapa keuntungan bersih setiap harinya tanpa harus hitung manual lagi.",
      },
      {
        userId: user2.id,
        rating: 5,
        comment: "Sebagai kasir, aplikasi ini sangat ringan dan mudah digunakan. Print struknya cepat dan tampilannya sangat modern. Gak bikin bingung!",
      },
      {
        userId: user3.id,
        rating: 5,
        comment: "Analisis K-Means sangat membantu saya dalam menentukan produk mana yang harus stok lebih banyak. StockSmart cerdas banget!",
      },
      {
        userId: user4.id,
        rating: 4,
        comment: "Dashboard-nya sangat informatif. Saya jadi lebih semangat jualan karena bisa lihat performa toko secara real-time di HP.",
      }
    ]
  });

  // Create a sample transaction
  await prisma.transaction.create({
    data: {
      totalPrice: 33000,
      ownerId: owner.id,
      items: {
        create: [
          {
            productId: products[0].id,
            quantity: 1,
            purchasePrice: 10000,
            subtotal: 15000
          },
          {
            productId: products[1].id,
            quantity: 1,
            purchasePrice: 12500,
            subtotal: 18000
          }
        ]
      }
    }
  });

  // console.log("Seed data created successfully!");
  // console.log("Credentials:");
  // console.log("Email: owner@gmail.com");
  // console.log("Password: admin123");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
