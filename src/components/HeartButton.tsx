import React from "react";
import { Pressable, StyleSheet, Text, ViewStyle } from "react-native";
import { useWishlist } from "../store/hooks";
import { colors } from "../theme";

interface Props {
  bookId: number;
  size?: number;
  style?: ViewStyle;
}

// BT8.8a ✔: nút tim đọc/ghi CHUNG store wishlist (hook useWishlist() → { isFavorite, toggle })
//   - fav = isFavorite(bookId); hiện ♥ (đỏ colors.heart) nếu fav, ♡ (colors.muted) nếu chưa
//   - onPress → toggle(bookId); accessibilityLabel "Yêu thích" / "Bỏ yêu thích"
// Không dùng useState riêng: mọi nút tim cùng đọc một store nên luôn khớp nhau.
export function HeartButton({ bookId, size = 34, style }: Props) {
  const { isFavorite, toggle } = useWishlist();
  const fav = isFavorite(bookId);

  return (
    <Pressable
      style={[styles.btn, { width: size, height: size, borderRadius: size / 2 }, style]}
      onPress={() => toggle(bookId)}
      accessibilityLabel={fav ? "Bỏ yêu thích" : "Yêu thích"}
    >
      <Text style={{ fontSize: size * 0.55, color: fav ? colors.heart : colors.muted }}>{fav ? "♥" : "♡"}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { position: "absolute", top: 8, right: 8, backgroundColor: "rgba(255,255,255,0.92)", alignItems: "center", justifyContent: "center", zIndex: 2 },
});