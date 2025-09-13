import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo,
} from "react";
import {
  View,
  Alert,
  PermissionsAndroid,
  Platform,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Camera,
  useCameraDevices,
  CameraPosition,
  VideoFile,
  PhotoFile,
} from "react-native-vision-camera";
import {
  useIsFocused,
  useNavigation,
  useRoute,
} from "@react-navigation/native";
import {
  Button,
  IconButton,
  Text,
  ActivityIndicator,
  Portal,
  Modal,
} from "react-native-paper";
import Slider from "@react-native-community/slider";
import Video from "react-native-video";
import { useDispatch } from "react-redux";
import msgActions from "@app/features/message/msg.action";
import { randomId } from "@app/utils/randomId";
import { persistLocalFile } from "@app/utils/file-utils";

type Props = {
  onClose?: () => void;
  onMediaCaptured?: (media: {
    path: string;
    type: "photo" | "video";
    durationMs?: number;
  }) => void;
};

const FLASH_MODES = ["off", "on"] as const;
type FlashMode = (typeof FLASH_MODES)[number];

type FilterId = "none" | "warm" | "cool" | "noir" | "rose";
const FILTERS: { id: FilterId; name: string; color: string }[] = [
  { id: "none", name: "Không", color: "transparent" },
  { id: "warm", name: "Ấm", color: "rgba(255,165,0,0.14)" },
  { id: "cool", name: "Lạnh", color: "rgba(0,153,255,0.14)" },
  { id: "noir", name: "Noir", color: "rgba(0,0,0,0.18)" },
  { id: "rose", name: "Hồng", color: "rgba(255,105,180,0.14)" },
];
type RouteParam = { id: string; name: string; avatar?: string; type?: string };

export default function CameraScreen2({ onClose, onMediaCaptured }: Props) {
  // router
  const navigation = useNavigation();
  const route = useRoute<any>();
  const param = route.params as RouteParam;
  const dispatch = useDispatch();

  const cameraRef = useRef<Camera>(null);
  const isFocused = useIsFocused();

  // Devices
  const devices = useCameraDevices();
  const [cameraPosition, setCameraPosition] = useState<CameraPosition>("back");
  const device = useMemo(
    () => Object.values(devices).find((d) => d?.position === cameraPosition),
    [devices, cameraPosition]
  );

  // Permissions & loading
  const [hasPermission, setHasPermission] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // UI state
  const [flash, setFlash] = useState<FlashMode>("off");
  const [isRecording, setIsRecording] = useState(false);
  const [recordStartedAt, setRecordStartedAt] = useState<number | null>(null);
  const [tick, setTick] = useState(0); // chỉ để re-render timer
  // Capture mode
  const [captureMode, setCaptureMode] = useState<"photo" | "video">("photo");

  // Zoom
  const [zoom, setZoom] = useState(0); // 0..1 (linear)
  const [selectedFilter, setSelectedFilter] = useState<FilterId>("none");

  // Preview state
  const [capturedMedia, setCapturedMedia] = useState<{
    path: string;
    type: "photo" | "video";
    durationMs?: number;
  } | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Derived zoom factor for VisionCamera (device range)
  const zoomFactor = useMemo(() => {
    const min = device?.minZoom ?? 1;
    const max = device?.maxZoom ?? 1;
    const v = min + (max - min) * zoom;
    if (Number.isNaN(v)) return 1;
    return Math.min(Math.max(v, min), max);
  }, [zoom, device]);

  // Timer tick
  useEffect(() => {
    let id: NodeJS.Timeout | null = null;
    if (isRecording) {
      id = setInterval(() => setTick((t) => t + 1), 250);
    }
    return () => {
      if (id) clearInterval(id);
    };
  }, [isRecording]);

  // Request permissions
  const requestPermissions = useCallback(async () => {
    try {
      setIsLoading(true);
      const cam = await Camera.requestCameraPermission();
      const mic = await Camera.requestMicrophonePermission();

      if (Platform.OS === "android") {
        const api = Platform.Version;
        if (typeof api === "number" && api < 33) {
          await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE
          ).catch(() => {});
        }
      }

      const ok = cam === "granted" && mic === "granted";
      setHasPermission(ok);
      if (!ok) {
        Alert.alert(
          "Quyền truy cập",
          "Ứng dụng cần quyền Camera và Microphone để hoạt động.",
          [
            { text: "Hủy", style: "cancel" },
            { text: "Thử lại", onPress: () => requestPermissions() },
          ]
        );
      }
    } catch (e) {
      console.error("Permission error:", e);
      Alert.alert("Lỗi", "Không thể yêu cầu quyền.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    requestPermissions();
  }, [requestPermissions]);

  // Actions
  const takePhoto = useCallback(async () => {
    try {
      if (!cameraRef.current) return;
      const photo: PhotoFile = await cameraRef.current.takePhoto({
        flash,
        enableShutterSound: true,
      });
      const media = { path: photo.path, type: "photo" as const };
      setCapturedMedia(media);
      setShowPreview(true);
    } catch (e) {
      console.error("takePhoto:", e);
      Alert.alert("Lỗi", "Không thể chụp ảnh.");
    }
  }, [flash]);

  const toggleRecording = useCallback(async () => {
    try {
      if (!cameraRef.current) return;

      if (isRecording) {
        await cameraRef.current.stopRecording();
        setIsRecording(false);
        setRecordStartedAt(null);
      } else {
        // Only allow starting recording when in video mode
        if (captureMode !== "video") return;
        setIsRecording(true);
        setRecordStartedAt(Date.now());
        cameraRef.current.startRecording({
          flash,
          onRecordingFinished: (video: VideoFile) => {
            const durationMs = recordStartedAt
              ? Date.now() - recordStartedAt
              : undefined;
            const media = {
              path: video.path,
              type: "video" as const,
              durationMs,
            };
            setCapturedMedia(media);
            setShowPreview(true);
          },
          onRecordingError: (err) => {
            console.error("record error:", err);
            Alert.alert("Lỗi", "Không thể quay video.");
            setIsRecording(false);
            setRecordStartedAt(null);
          },
        });
      }
    } catch (e) {
      console.error("toggleRecording:", e);
      Alert.alert("Lỗi", "Không thể thao tác video.");
      setIsRecording(false);
      setRecordStartedAt(null);
    }
  }, [isRecording, flash, recordStartedAt, captureMode]);

  const switchCamera = useCallback(() => {
    setCameraPosition((p) => (p === "back" ? "front" : "back"));
  }, []);

  const cycleFlash = useCallback(() => {
    setFlash((prev) => (prev === "off" ? "on" : "off"));
  }, []);

  const formatTime = useCallback((ms: number) => {
    const s = Math.floor(ms / 1000) % 60;
    const m = Math.floor(ms / 60000);
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }, []);

  const handleSave = useCallback(async () => {
    console.log("🚀 ~ CameraScreen2 ~ capturedMedia:", capturedMedia);

    if (capturedMedia) onMediaCaptured?.(capturedMedia);
    if (capturedMedia) {
      const persistentUri = await persistLocalFile(capturedMedia);
      console.log("🚀 ~ CameraScreen2 ~ persistentUri:", persistentUri);

      // Get image dimensions for photos
      let width: number | undefined;
      let height: number | undefined;

      if (capturedMedia.type === "photo") {
        try {
          await new Promise<void>((resolve, reject) => {
            Image.getSize(
              persistentUri.startsWith("file://")
                ? persistentUri
                : `file://${persistentUri}`,
              (w, h) => {
                width = w;
                height = h;
                resolve();
              },
              (error) => {
                console.warn("Failed to get image size:", error);
                resolve(); // Continue without dimensions
              }
            );
          });
        } catch (error) {
          console.warn("Error getting image dimensions:", error);
        }
      }

      dispatch(
        msgActions.addAttachmentToMsg({
          roomId: param.id,
          attachment: {
            id: `attachment_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            url: persistentUri.startsWith("file://")
              ? persistentUri
              : `file://${persistentUri}`,
            kind: capturedMedia.type === "video" ? "video" : "image",
            name: `camera_${capturedMedia.type}_${Date.now()}.${
              capturedMedia.type === "video" ? "mp4" : "jpg"
            }`,
            status: "processing" as const,
            mimetype:
              capturedMedia.type === "video" ? "video/mp4" : "image/jpeg",
            duration:
              capturedMedia.type === "video"
                ? capturedMedia.durationMs
                : undefined,
            width,
            height,
          },
        })
      );
    }
    navigation.goBack();
    setShowPreview(false);
    setCapturedMedia(null);
  }, [capturedMedia, onMediaCaptured]);

  const handleCancel = useCallback(() => {
    setShowPreview(false);
    setCapturedMedia(null);
  }, []);

  const recordingDuration = recordStartedAt ? Date.now() - recordStartedAt : 0;

  // Loading
  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <ActivityIndicator size="large" />
        <Text className="text-white mt-4 text-base">
          Đang khởi tạo camera...
        </Text>
      </SafeAreaView>
    );
  }

  // No permission
  if (!hasPermission) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center px-6">
        <Text className="text-white text-center text-base mb-5">
          Cần quyền truy cập Camera và Microphone
        </Text>
        <Button
          mode="contained"
          onPress={requestPermissions}
          className="w-full"
        >
          Cấp quyền
        </Button>
      </SafeAreaView>
    );
  }

  // No device
  if (!device) {
    return (
      <SafeAreaView className="flex-1 bg-black items-center justify-center">
        <Text className="text-white text-base">Không tìm thấy camera</Text>
      </SafeAreaView>
    );
  }

  return (
    <View className="flex-1">
      {/* Camera */}
      <View className="">
        <Camera
          ref={cameraRef}
          style={{ height: "100%" }}
          device={device}
          isActive={isFocused && !showPreview}
          photo
          video
          audio
          zoom={zoomFactor}
        />
        {/* Filter overlay - sits above camera, below controls */}
        <View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFillObject,
            {
              backgroundColor:
                FILTERS.find((f) => f.id === selectedFilter)?.color ??
                "transparent",
              zIndex: 0,
            },
          ]}
        />

        {/* Top controls */}
        <View className="absolute top-0 left-0 right-0 px-4 pt-4 flex-row items-center justify-between">
          <View className="flex-1 items-center">
            {isRecording && (
              <View className="flex-row items-center px-3 py-1 rounded-full bg-red-600/90">
                <View className="w-2 h-2 rounded-full bg-white mr-2" />
                <Text className="text-white font-bold">
                  {formatTime(recordingDuration)}
                </Text>
              </View>
            )}
          </View>

          <IconButton
            icon={flash === "off" ? "flash-off" : "flash"}
            size={24}
            iconColor="white"
            onPress={cycleFlash}
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          />
        </View>

        {/* Bottom controls */}
        <View className="absolute bottom-0 left-0 right-0 pb-10 px-5">
          {/* Filters Row */}
          <View className="mb-3">
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {FILTERS.map((f) => (
                <TouchableOpacity
                  key={f.id}
                  onPress={() => setSelectedFilter(f.id)}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: 9999,
                    marginRight: 8,
                    backgroundColor:
                      selectedFilter === f.id
                        ? "rgba(255,255,255,0.25)"
                        : "rgba(0,0,0,0.35)",
                  }}
                >
                  <Text style={{ color: "white" }}>{f.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          {/* Zoom */}
          <View className="bg-white/10 rounded-2xl px-4 py-3 mb-4">
            <Slider
              value={zoom}
              onValueChange={(v) => setZoom(v)}
              minimumValue={0}
              maximumValue={1}
              step={0.01}
              minimumTrackTintColor="#fff"
              maximumTrackTintColor="#888"
              thumbTintColor="#fff"
              style={{ width: "100%", height: 40 }}
            />
          </View>

          <View className="flex-row items-center justify-center">
            {/* Switch */}
            <IconButton
              icon="camera-flip"
              size={32}
              iconColor="white"
              onPress={switchCamera}
              style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                marginHorizontal: 20,
              }}
            />

            {/* Capture / Record */}
            <TouchableOpacity
              className={`w-20 h-20 rounded-full items-center justify-center ${
                isRecording
                  ? "bg-red-600"
                  : captureMode === "video"
                  ? "bg-red-500"
                  : "bg-white"
              }`}
              onPress={() => {
                if (captureMode === "photo") {
                  return takePhoto();
                }
                // video mode: toggle start/stop
                return toggleRecording();
              }}
            >
              <View
                className={`${
                  isRecording
                    ? "w-9 h-9 rounded-md bg-white"
                    : captureMode === "video"
                    ? "w-16 h-16 rounded-full bg-red-600 border-2 border-red-300"
                    : "w-16 h-16 rounded-full bg-white border-2 border-neutral-300"
                }`}
              />
            </TouchableOpacity>

            {/* Mode toggle / Stop */}
            <IconButton
              icon={
                isRecording
                  ? "stop"
                  : captureMode === "video"
                  ? "camera"
                  : "video"
              }
              size={32}
              iconColor="white"
              onPress={() => {
                if (isRecording) return toggleRecording();
                // switch modes when not recording
                setCaptureMode((m) => (m === "photo" ? "video" : "photo"));
              }}
              style={{
                backgroundColor: "rgba(0,0,0,0.5)",
                marginHorizontal: 20,
              }}
            />
          </View>
        </View>
      </View>

      {/* Preview */}
      <Portal>
        <Modal
          visible={showPreview}
          onDismiss={handleCancel}
          contentContainerStyle={{ flex: 1, backgroundColor: "black" }}
        >
          <View className="flex-1">
            {/* Header */}
            <View className="flex-row items-center justify-between px-4 py-4">
              <IconButton
                icon="arrow-left"
                size={24}
                iconColor="white"
                onPress={handleCancel}
              />
              <Text className="text-white text-lg font-bold">
                {capturedMedia?.type === "photo"
                  ? "Ảnh đã chụp"
                  : "Video đã quay"}
              </Text>
              <View style={{ width: 48 }} />
            </View>

            {/* Content */}
            <View className="flex-1 items-center justify-center">
              {capturedMedia?.type === "photo" ? (
                <Image
                  source={{ uri: `file://${capturedMedia.path}` }}
                  className="w-full"
                  style={{ height: "70%" }}
                  resizeMode="contain"
                />
              ) : (
                <View className="relative w-full" style={{ height: "70%" }}>
                  <Video
                    source={{
                      uri: capturedMedia?.path.startsWith("file://")
                        ? capturedMedia.path
                        : `file://${capturedMedia?.path}`,
                    }}
                    style={{ width: "100%", height: "100%" }}
                    resizeMode="contain"
                    controls
                    paused={false}
                    repeat={false}
                    onError={(e) => console.log("Video error", e)}
                    ignoreSilentSwitch="obey"
                  />
                </View>
              )}
            </View>

            {/* Actions */}
            <View className="flex-row justify-around px-5 py-5 pb-10">
              <Button
                mode="outlined"
                onPress={handleCancel}
                textColor="white"
                className="flex-1 mx-2"
              >
                Hủy
              </Button>
              <Button
                mode="contained"
                onPress={handleSave}
                className="flex-1 mx-2"
              >
                Lưu
              </Button>
            </View>
          </View>
        </Modal>
      </Portal>
    </View>
  );
}
