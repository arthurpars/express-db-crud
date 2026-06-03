require("dotenv").config();
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  await prisma.order.deleteMany();
  await prisma.user.deleteMany();
  await prisma.product.deleteMany();

  const [alice, bob, carol] = await Promise.all([
    prisma.user.create({
      data: { name: "Alice Martin", email: "alice@example.com" },
    }),
    prisma.user.create({
      data: { name: "Bob Chen", email: "bob@example.com" },
    }),
    prisma.user.create({
      data: { name: "Carol Smith", email: "carol@example.com" },
    }),
  ]);

  const [laptop, headphones, keyboard] = await Promise.all([
    prisma.product.create({
      data: { name: "Laptop Pro 15", price: 1299.99, stock: 50 },
    }),
    prisma.product.create({
      data: { name: "Noise-Cancelling Headphones", price: 299.99, stock: 120 },
    }),
    prisma.product.create({
      data: { name: "Mechanical Keyboard", price: 149.99, stock: 75 },
    }),
  ]);

  await Promise.all([
    prisma.order.create({
      data: {
        userId: alice.id,
        productId: laptop.id,
        quantity: 1,
        status: "completed",
      },
    }),
    prisma.order.create({
      data: {
        userId: bob.id,
        productId: headphones.id,
        quantity: 2,
        status: "pending",
      },
    }),
  ]);

  console.log("PostgreSQL seed complete: 3 users, 3 products, 2 orders");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
