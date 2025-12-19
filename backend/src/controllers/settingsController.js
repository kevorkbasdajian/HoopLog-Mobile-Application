import * as settingsService from "../services/settingsService.js";

//GET get settings for a user
export async function getSettings(req, res, next) {
  try {
    const userId = req.user.id;
    const settings = await settingsService.getUserSettings(userId);
    res.status(200).json(settings);
  } catch (err) {
    next(err);
  }
}

//PUT update settings for a user
export async function updateSettings(req, res, next) {
  try {
    const userId = req.user.id;
    const data = req.body;
    const updated = await settingsService.updateUserSettings(userId, data);
    res.status(200).json(updated);
  } catch (err) {
    next(err);
  }
}
