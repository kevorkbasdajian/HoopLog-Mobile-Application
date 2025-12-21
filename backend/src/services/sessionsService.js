import { prisma } from "../db/prismaClient.js";

//GET get all sessions and optionally filter them
export async function getPrebuiltSessions({ title, type, difficulty }) {
  const where = {
    ownerId: null,
    AND: [
      title ? { title: { contains: title, mode: "insensitive" } } : {},
      type ? { type } : {},
      difficulty ? { difficulty } : {},
    ],
  };

  const sessions = await prisma.sessionData.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return sessions;
}

//GET get all user-subscribed sessions and optionally filter them
export async function getAllSessions({
  userId,
  title,
  type,
  difficulty,
  favorite,
}) {
  const where = {
    userId,
    AND: [
      title
        ? { session: { title: { contains: title, mode: "insensitive" } } }
        : undefined,
      type ? { session: { type } } : undefined,
      difficulty ? { session: { difficulty } } : undefined,
      favorite !== undefined ? { favorite } : undefined,
    ].filter(Boolean),
  };

  const sessions = await prisma.userSessionProgress.findMany({
    where,
    include: {
      session: true,
    },
    orderBy: { createdAt: "desc" },
  });
  return sessions;
}

//GET get a session by ID
export async function getSessionById(id) {
  if (!id) {
    throw { status: 400, message: "Session ID is required" };
  }
  const session = await prisma.sessionData.findUnique({
    where: { id: Number(id) },
  });
  if (!session) throw { status: 404, message: "Session not found" };

  return session;
}

//POST create a session
export async function createSession({ userId, data, photoUrl }) {
  const session = await prisma.sessionData.create({
    data: {
      ...data,
      duration: Number(data.duration),
      intensity: Number(data.intensity),
      image: photoUrl,
      ownerId: userId,
    },
  });

  return session;
}

//POST subscribe a user to a session
export async function subscribeToSession({ userId, sessionId }) {
  const session = await prisma.sessionData.findUnique({
    where: { id: Number(sessionId) },
  });
  if (!session) throw { status: 404, message: "Session not found" };
  let progress = await prisma.userSessionProgress.findUnique({
    where: { unique_user_session: { userId, sessionId: Number(sessionId) } },
  });
  if (!progress) {
    progress = await prisma.userSessionProgress.create({
      data: {
        userId,
        sessionId: Number(sessionId),
        progress: 0,
        favorite: false,
      },
    });
  }
  return progress;
}

//PUT update a session's data
export async function updateSessionData({ userId, sessionId, data }) {
  const session = await prisma.sessionData.findUnique({
    where: { id: Number(sessionId) },
  });

  if (!session) throw { status: 404, message: "Session not found" };
  if (session.ownerId !== userId)
    throw { status: 403, message: "Unauthorized to edit this session" };

  const updated = await prisma.sessionData.update({
    where: { id: Number(sessionId) },
    data,
  });

  return updated;
}

//PUT update an user-specific progress
export async function updateUserProgress({ userId, sessionId, data }) {
  let progress = await prisma.userSessionProgress.findUnique({
    where: { unique_user_session: { userId, sessionId: Number(sessionId) } },
  });

  if (!progress) {
    progress = await prisma.userSessionProgress.create({
      data: {
        userId,
        sessionId: Number(sessionId),
        progress: data.progress ?? 0,
        favorite: data.favorite ?? false,
      },
    });
    return progress;
  }

  const updated = await prisma.userSessionProgress.update({
    where: { unique_user_session: { userId, sessionId: Number(sessionId) } },
    data,
  });

  return updated;
}

//DELETE delete a session
export async function deleteSession({ userId, sessionId }) {
  const session = await prisma.sessionData.findUnique({
    where: { id: Number(sessionId) },
  });
  if (!session) throw { status: 404, message: "Session not found" };
  if (session.ownerId !== userId)
    throw { status: 403, message: "Unauthorized to delete this session" };

  await prisma.userSessionProgress.deleteMany({
    where: { sessionId: Number(sessionId) },
  });
  await prisma.sessionData.delete({
    where: { id: Number(sessionId) },
  });

  return { message: "Session deleted successfully" };
}

//POST Toggle favorite for a session
export async function toggleFavorite({ userId, sessionId, favorite }) {
  let progress = await prisma.userSessionProgress.findUnique({
    where: { unique_user_session: { userId, sessionId: Number(sessionId) } },
  });

  if (!progress) {
    progress = await prisma.userSessionProgress.create({
      data: {
        userId,
        sessionId: Number(sessionId),
        progress: 0,
        favorite: favorite ?? true,
      },
    });
    return progress;
  }

  const updated = await prisma.userSessionProgress.update({
    where: { unique_user_session: { userId, sessionId: Number(sessionId) } },
    data: { favorite: favorite ?? !progress.favorite },
  });

  return updated;
}

//DELETE unsubscribe from a session
export async function unsubscribeSession({ userId, sessionId }) {
  const existing = await prisma.userSessionProgress.findUnique({
    where: { unique_user_session: { userId, sessionId } },
  });
  if (!existing)
    throw { status: 404, message: "You are not subscribed to this session" };
  await prisma.userSessionProgress.delete({
    where: { unique_user_session: { userId, sessionId } },
  });
  return true;
}

//DELETE delete all progress records for a specific user
export async function resetUserProgress(userId) {
  await prisma.userSessionProgress.deleteMany({
    where: { userId },
  });

  return { message: "All progress has been reset" };
}
