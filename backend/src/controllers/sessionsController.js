import { error } from "console";
import * as sessionsService from "../services/sessionsService.js";
import { uploadFileToBucket } from "../services/uploadService.js";

//GET get all subscribed sessions and query them by Title, Type, Difficulty, and Favorite
export async function getUserSessions(req, res, next) {
  try {
    const userId = req.user?.id;

    const { title, type, difficulty, favorite } = req.query;
    const favFilter = favorite !== undefined ? favorite === "true" : undefined;

    const sessions = await sessionsService.getAllSessions({
      userId,
      title,
      type,
      difficulty,
      favorite: favFilter,
    });
    res.status(200).json(sessions);
  } catch (err) {
    next(err);
  }
}

//GET get all prebuilt sessions and optionally filter them

export async function getPrebuiltSessions(req, res, next) {
  try {
    const { title, type, difficulty } = req.query;
    const sessions = await sessionsService.getPrebuiltSessions({
      title,
      type,
      difficulty,
    });
    res.status(200).json(sessions);
  } catch (err) {
    next(err);
  }
}

// GET get a session by Id
export async function getSessionById(req, res, next) {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: "Session ID is required" });
    }
    const session = await sessionsService.getSessionById(id);
    res.status(200).json(session);
  } catch (err) {
    next(err);
  }
}

//POST create a session

export async function createSession(req, res, next) {
  try {
    const userId = req.user.id;
    const data = req.body;

    let photoUrl = null;

    if (req.file) {
      photoUrl = await uploadFileToBucket(
        req.file,
        process.env.SUPABASE_BUCKET_SESSION
      );
    }

    const session = await sessionsService.createSession({
      userId,
      data,
      photoUrl,
    });

    res.status(201).json(session);
  } catch (err) {
    next(err);
  }
}

//POST mark a session as favorite
export async function toggleFavorite(req, res, next) {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const { favorite } = req.body;
    const updated = await sessionsService.toggleFavorite({
      userId,
      sessionId,
      favorite,
    });
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

//PUT update a session by Id

export async function updateSessionData(req, res, next) {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const data = req.body;
    const updated = await sessionsService.updateSessionData({
      userId,
      sessionId,
      data,
    });
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

//PUT update a user's session related data

export async function updateUserProgress(req, res, next) {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const data = req.body;
    const updated = await sessionsService.updateUserProgress({
      userId,
      sessionId,
      data,
    });
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}

//DELETE delete a session by Id
export async function deleteSession(req, res, next) {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const result = await sessionsService.deleteSession({ userId, sessionId });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

//POST subscribe a user to a session
export async function subscribeToSession(req, res, next) {
  try {
    const userId = req.user.id;
    const sessionId = req.params.id;
    const progress = await sessionsService.subscribeToSession({
      userId,
      sessionId,
    });
    res.status(201).json(progress);
  } catch (err) {
    next(err);
  }
}

//DELETE Unsubscribe a user from a session

export async function unsubscribeSession(req, res, next) {
  try {
    const userId = req.user.id;
    const sessionId = Number(req.params.id);
    if (!sessionId) console.log("session id is null", sessionId);
    await sessionsService.unsubscribeSession({
      userId,
      sessionId,
    });
    return res.json({ message: "Session unsubscribed successfully" });
  } catch (err) {
    next(err);
  }
}

//POST delete all user progress
export async function resetProgress(req, res, next) {
  try {
    const userId = req.user.id;
    const result = await sessionsService.resetUserProgress(userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
