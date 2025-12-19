import { prisma } from "../db/prismaClient.js";

//PUT Update user profile info

export async function updateUserProfile({ userId, data, avatarUrl }) {
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: data.fullName,
      phone: data.phone,
      ...(avatarUrl && { avatar: avatarUrl }),
    },
  });

  return updatedUser;
}
