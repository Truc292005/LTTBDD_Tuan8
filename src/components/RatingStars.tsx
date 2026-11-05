import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors } from "../theme";

interface Props {
  value: number; // 0–5 (có thể lẻ, làm tròn khi vẽ)
  size?: number;
  onChange?: (v: number) => void; // có truyền → cho phép bấm chọn sao
}

// BT8.5a ✔: component sao TÁI SỬ DỤNG
//   - vẽ 5 ngôi sao ★: sao <= Math.round(value) màu colors.warning, còn lại colors.line; cỡ chữ = size
//   - nếu có onChange: bọc mỗi sao trong Pressable, bấm sao n → onChange(n)
//   - accessibilityLabel của mỗi sao: `${n} sao`
export function RatingStars({ value, size = 18, onChange }: Props) {
  const filled = Math.round(value); // 4.5 → 5 sao vàng

  return (
    <View style={styles.row}>
      {[1, 2, 3, 4, 5].map((n) => {
        const star = (
          <Text key={n} style={{ fontSize: size, color: n <= filled ? colors.warning : colors.line }}>
            ★
          </Text>
        );
        // Có onChange → chế độ nhập: bọc Pressable. Không có → chỉ hiển thị.
        return onChange ? (
          <Pressable key={n} onPress={() => onChange(n)} hitSlop={4} accessibilityLabel={`${n} sao`}>
            {star}
          </Pressable>
        ) : (
          star
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center" },
});