import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";
import { decryptSecret, encryptSecret } from "@/lib/crypto";
import type { GhlCredentials } from "@/lib/types";

export async function createUser(
  email: string,
  password: string,
  name?: string
) {
  const passwordHash = await bcrypt.hash(password, 12);
  return prisma.user.create({
    data: {
      email: email.toLowerCase().trim(),
      passwordHash,
      name: name?.trim() || null,
    },
    select: { id: true, email: true, name: true, createdAt: true },
  });
}

export async function verifyUser(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase().trim() },
  });
  if (!user) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
  };
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
      ghlConnection: {
        select: {
          locationId: true,
          updatedAt: true,
        },
      },
    },
  });
}

export async function saveGhlConnection(
  userId: string,
  locationId: string,
  apiToken: string
) {
  const encryptedToken = encryptSecret(apiToken.trim());
  return prisma.ghlConnection.upsert({
    where: { userId },
    create: {
      userId,
      locationId: locationId.trim(),
      apiToken: encryptedToken,
    },
    update: {
      locationId: locationId.trim(),
      apiToken: encryptedToken,
    },
    select: {
      locationId: true,
      updatedAt: true,
    },
  });
}

export async function deleteGhlConnection(userId: string) {
  await prisma.ghlConnection.deleteMany({ where: { userId } });
}

export async function getGhlCredentialsForUser(
  userId: string
): Promise<GhlCredentials | null> {
  const connection = await prisma.ghlConnection.findUnique({
    where: { userId },
  });
  if (!connection) return null;

  return {
    locationId: connection.locationId,
    token: decryptSecret(connection.apiToken),
  };
}
