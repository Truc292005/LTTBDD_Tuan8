import React, { useEffect } from "react";
import { StyleSheet, Text, View } from "react-native";
import { useAuth } from "../store/hooks";
import { RootScreenProps } from "../navigation/types";
import { colors, formatPrice } from "../theme";

// KHUNG TỐI GIẢN: form địa chỉ + đặt hàng làm ở buổi sau.
// BT8.4 ✔ (lớp bảo vệ thứ 2): dùng useAuth() → isLoggedIn; trong useEffect, nếu chưa đăng nhập thì
//   navigation.replace("Login", { redirectTo: "Checkout", total: route.params.total }); chưa đăng nhập thì return null.
export function CheckoutScreen({ navigation, route }: RootScreenProps<"Checkout">) {
  const { isLoggedIn } = useAuth();

  // Có thể vào Checkout bằng đường khác (liên kết, điều hướng nhầm) → màn này tự kiểm tra
  useEffect(() => {
    if (!isLoggedIn) navigation.replace("Login", { redirectTo: "Checkout", total: route.params.total });
  }, [isLoggedIn, navigation, route.params.total]);

  if (!isLoggedIn) return null; // chưa đăng nhập thì không vẽ gì (tránh nháy nội dung)

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tổng tiền cần thanh toán</Text>
      <Text style={styles.total}>{formatPrice(route.params.total)}</Text>
      <Text style={styles.note}>(Form địa chỉ & thanh toán sẽ làm ở buổi sau)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.bg, gap: 8 },
  label: { color: colors.muted, fontSize: 15 },
  total: { fontSize: 32, fontWeight: "800", color: colors.indigo },
  note: { color: colors.muted, marginTop: 12 },
});