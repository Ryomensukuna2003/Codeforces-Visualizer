import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function getData() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined");
  }

  try {
    const data = await prisma.user.findMany();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Failed to fetch data");
  } finally {
    await prisma.$disconnect();
  }
}