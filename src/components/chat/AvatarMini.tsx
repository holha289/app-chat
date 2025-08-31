import React from "react";
import { Image } from "react-native";

type Props = { uri: string; side: "left" | "right" };

export default function AvatarMini({ uri, side }: Props) {
  return (
    <Image
      source={{ uri }}
      className={`absolute bottom-1 z-10 h-8 w-8 rounded-full ${side === "right" ? "-right-3" : "-left-3"}`}
    />
  );
}
