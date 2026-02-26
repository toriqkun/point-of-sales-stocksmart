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
  await prisma.transactionItem.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.product.deleteMany();
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
        stock: 50, 
        ownerId: owner.id 
      } 
    }),
    prisma.product.create({ 
      data: { 
        name: "Burger Keju", 
        price: 18000, 
        stock: 45, 
        ownerId: owner.id 
      } 
    }),
    prisma.product.create({ 
      data: { 
        name: "Burger Special", 
        price: 25000, 
        stock: 30, 
        ownerId: owner.id 
      } 
    }),
    prisma.product.create({ 
      data: { 
        name: "French Fries", 
        price: 12000, 
        stock: 60, 
        ownerId: owner.id 
      } 
    }),
    prisma.product.create({ 
      data: { 
        name: "Iced Tea", 
        price: 5000, 
        stock: 100, 
        ownerId: owner.id 
      } 
    }),
  ]);

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
            subtotal: 15000
          },
          {
            productId: products[1].id,
            quantity: 1,
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
