import { useEffect, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { CameraRoll, PhotoIdentifier } from "@react-native-camera-roll/camera-roll";

async function ensureMediaPermission() {
  if (Platform.OS === "android") {
    const api = Number(Platform.Version);
    if (api >= 33) {
      const img = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES
      );
      const vid = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO
      );
      return img === "granted" || vid === "granted";
    } else {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      return granted === "granted";
    }
  }
  return true; // iOS sẽ xin qua react-native-permissions
}

export default function useMedia() {
  const [photos, setPhotos] = useState<PhotoIdentifier[]>([]);

  useEffect(() => {
    (async () => {
      const hasPerm = await ensureMediaPermission();
      if (!hasPerm) return;

      // Lấy tất cả media - bắt đầu với số lượng lớn
      let allPhotos: PhotoIdentifier[] = [];
      let hasNextPage = true;
      let after: string | undefined;

      while (hasNextPage) {
        const result = await CameraRoll.getPhotos({
          first: 1000,                 // Lấy 1000 items mỗi lần
          after: after,                // Cursor để phân trang
          assetType: "All",            // "Photos" | "Videos" | "All"
          groupTypes: "All",           // iOS only
          include: ["filename", "fileSize", "imageSize", "playableDuration"],
        });

        allPhotos = [...allPhotos, ...result.edges];
        hasNextPage = result.page_info.has_next_page;
        after = result.page_info.end_cursor;

        // Giới hạn tối đa để tránh crash app (tuỳ chọn)
        if (allPhotos.length >= 5000) break;
      }
      
      setPhotos(allPhotos);
    })();
  }, []);

  return photos;
}
