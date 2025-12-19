import * as userService from "../services/userService.js";
import { uploadFileToBucket } from "../services/uploadService.js";

//PUT update user profile

export async function updateUserProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const data = req.body;
    let avatarUrl;

    if (req.file) {
      avatarUrl = await uploadFileToBucket(
        req.file,
        process.env.SUPABASE_BUCKET_AVATARS
      );
    }
    const updatedUser = await userService.updateUserProfile({
      userId,
      data,
      avatarUrl,
    });
    res.status(200).json(updatedUser);
  } catch (err) {
    next(err);
  }
}
