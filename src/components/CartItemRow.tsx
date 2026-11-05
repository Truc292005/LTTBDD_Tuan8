import React, { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { CartItem } from "../types";
import { useDebounce } from "../hooks/useDebounce";
import { colors, formatPrice, radius } from "../theme";

interface Props {
  item: CartItem;
  onChangeQty: (bookId: number, quantity: number) => void;
  onRemove: (bookId: number) => void;
}

// BT8.6 ✔: nút −/+ với STATE CỤC BỘ + debounce 300ms
//   1) const [qty, setQty] = useState(item.quantity); const debouncedQty = useDebounce(qty, 300);
//   2) useEffect: khi debouncedQty khác item.quantity → onChangeQty(item.bookId, debouncedQty)
//   3) useEffect: khi item.quantity đổi từ nơi khác → setQty(item.quantity)
//   4) canDec = qty > 1; canInc = qty < item.stock (không vượt tồn kho); nút bị mờ khi không bấm được
//   5) hiển thị "Còn {item.stock}"
// (Bản starter chỉ hiện số lượng tĩnh "x{quantity}" — đã thay bằng cụm nút − số lượng +.)
export function CartItemRow({ item, onChangeQty, onRemove }: Props) {
  // Số lượng cục bộ: bấm là đổi ngay trên màn hình, chưa đụng tới store
  const [qty, setQty] = useState(item.quantity);
  // Giá trị "đã lắng": chỉ cập nhật sau khi ngừng bấm 300 ms
  const debouncedQty = useDebounce(qty, 300);

  // (2) Dừng bấm 300 ms → mới ghi vào store một lần
  useEffect(() => {
    if (debouncedQty !== item.quantity) onChangeQty(item.bookId, debouncedQty);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQty]);

  // (3) Store đổi từ nơi khác (nạp giỏ từ AsyncStorage, xóa rồi thêm lại...) → đồng bộ lại số hiển thị
  useEffect(() => {
    setQty(item.quantity);
  }, [item.quantity]);

  // (4) Giới hạn: không dưới 1, không vượt tồn kho
  const canDec = qty > 1;
  const canInc = qty < item.stock;

  return (
    <View style={styles.row}>
      <View style={[styles.cover, { backgroundColor: item.color }]}>
        <Text style={styles.emoji}>{item.emoji}</Text>
      </View>
      <View style={styles.info}>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.price}>{formatPrice(item.price)}</Text>
        <View style={styles.stepper}>
          <Pressable
            style={[styles.stepBtn, !canDec && styles.stepBtnDisabled]}
            disabled={!canDec}
            onPress={() => setQty((q) => q - 1)}
            accessibilityLabel="Giảm"
          >
            <Text style={styles.stepText}>−</Text>
          </Pressable>
          <Text style={styles.qty}>{qty}</Text>
          <Pressable
            style={[styles.stepBtn, !canInc && styles.stepBtnDisabled]}
            disabled={!canInc}
            onPress={() => setQty((q) => q + 1)}
            accessibilityLabel="Tăng"
          >
            <Text style={styles.stepText}>+</Text>
          </Pressable>
          <Text style={styles.stock}>Còn {item.stock}</Text>
        </View>
      </View>
      <Pressable onPress={() => onRemove(item.bookId)} hitSlop={8} accessibilityLabel="Xóa khỏi giỏ">
        <Text style={styles.trash}>🗑️</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", backgroundColor: colors.card, borderRadius: radius.md, padding: 10, marginHorizontal: 12, marginVertical: 5, gap: 10 },
  cover: { width: 54, height: 72, borderRadius: radius.sm, alignItems: "center", justifyContent: "center" },
  emoji: { fontSize: 26 },
  info: { flex: 1, gap: 2 },
  title: { fontWeight: "700", color: colors.text },
  price: { color: colors.indigo, fontWeight: "800" },
  stepper: { flexDirection: "row", alignItems: "center", gap: 8, marginTop: 4 },
  stepBtn: { width: 28, height: 28, borderRadius: 14, borderWidth: 1.5, borderColor: colors.indigo, alignItems: "center", justifyContent: "center" },
  stepBtnDisabled: { opacity: 0.3 }, // nút không bấm được thì làm mờ
  stepText: { color: colors.indigo, fontWeight: "800", fontSize: 16, lineHeight: 18 },
  qty: { fontWeight: "800", color: colors.navy, fontSize: 16, minWidth: 22, textAlign: "center" },
  stock: { color: colors.muted, fontSize: 12, marginLeft: 4 },
  trash: { fontSize: 22 },
});