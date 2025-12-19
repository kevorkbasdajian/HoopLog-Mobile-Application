import { prisma } from "../db/prismaClient.js";

//GET get settings for a user
export async function getUserSettings(userId) {
  return await prisma.setting.findUnique({
    where: { userId },
  });
}

//PUT update settings for a user
export async function updateUserSettings(userId, data) {
  return await prisma.setting.update({
    where: { userId },
    data,
  });
}
