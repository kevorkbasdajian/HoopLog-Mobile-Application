import { prisma } from "../db/prismaClient.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { jwtSecret } from "../config/index.js";

export async function signup({ fullName, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw { status: 409, message: "User already exists" };

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      fullName,
      email,
      password: hashedPassword,
      avatar: "",
      phone: "",
    },
  });

  await prisma.setting.create({
    data: {
      userId: user.id,
      motivationalQuotes: false,
      vibrationEffects: false,
    },
  });

  const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "7d" });

  return { user, token };
}

export async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user)
    throw { status: 401, message: "No account found with this email address" };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw { status: 401, message: "Incorrect password" };

  const token = jwt.sign({ userId: user.id }, jwtSecret, { expiresIn: "7d" });

  return { user, token };
}
