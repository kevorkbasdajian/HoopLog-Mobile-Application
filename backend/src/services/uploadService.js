import { supabase } from "../utils/supabase.js";
import { v4 as uuidv4 } from "uuid";

export async function uploadFileToBucket(file, bucketName) {
  const fileExt = file.originalname.split(".").pop();
  const fileName = `${uuidv4()}.${fileExt}`;

  const { error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });

  if (error) throw error;

  const { data } = supabase.storage.from(bucketName).getPublicUrl(fileName);

  return data.publicUrl;
}
