import { prisma } from "../db/prismaClient.js";

//GET Receive a random quote
export async function getRandomQuote() {
  const totalQuotes = await prisma.quote.count();
  if (totalQuotes === 0) return null;

  const randomIndex = Math.floor(Math.random() * totalQuotes);

  const [quote] = await prisma.quote.findMany({
    take: 1,
    skip: randomIndex,
  });

  return quote;
}
