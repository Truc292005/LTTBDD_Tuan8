import React, { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { FormField } from "../components/FormField";
import { PrimaryButton } from "../components/PrimaryButton";
import { login } from "../services/authService"; // đã viết sẵn: login(email, password) → { user, token }
import { getErrorMessage } from "../api/client";
import { useAuth } from "../store/hooks";
import { validateEmail, validatePassword } from "../utils/validators"; // đã viết sẵn: trả về chuỗi lỗi hoặc null
import { RootScreenProps } from "../navigation/types";
import { colors } from "../theme";

export function LoginScreen({ navigation, route }: RootScreenProps<"Login">) {
  const { signIn } = useAuth();
  // BT8.1 ✔: khai báo state: email, password, errors, submitError, loading
  //   gợi ý: const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  // Câu hỏi bổ sung số 5: state điều khiển ẩn/hiện mật khẩu (false = đang ẩn)
  const [showPassword, setShowPassword] = useState(false);

  // BT8.1 ✔: viết hàm submit
  //   1) validate 2 ô → setErrors; còn lỗi thì dừng
  //   2) setLoading(true) → gọi login(email, password) → signIn(user, token)
  //   3) nếu route.params?.redirectTo === "Checkout" → navigation.replace("Checkout", { total: route.params.total ?? 0 })
  //      ngược lại → navigation.navigate("Tabs", { screen: "Home" })
  //   4) catch → setSubmitError(getErrorMessage(err)); finally → setLoading(false)
  const submit = async () => {
    // 1) validate 2 ô, mỗi hàm trả về chuỗi lỗi hoặc null
    const e = { email: validateEmail(email), password: validatePassword(password) };
    setErrors(e);
    if (e.email || e.password) return; // còn lỗi thì dừng, không gọi API

    // 2) bật loading để nút không bấm được hai lần, xóa lỗi chung của lần trước
    setLoading(true);
    setSubmitError(null);
    try {
      const { user, token } = await login(email, password);
      signIn(user, token); // lưu vào store (usePersistence sẽ tự ghi xuống AsyncStorage)

      // 3) có "đích đến" kèm theo (đi từ giỏ hàng sang) thì quay lại đúng Checkout
      //    replace: thay màn Login bằng Checkout, bấm ← không quay lại Login
      if (route.params?.redirectTo === "Checkout") navigation.replace("Checkout", { total: route.params.total ?? 0 });
      else navigation.navigate("Tabs", { screen: "Home" });
    } catch (err) {
      // 4) sai mật khẩu, lỗi mạng... → hiện dòng đỏ chung
      setSubmitError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.logo}>📚</Text>
        <Text style={styles.title}>Đăng nhập BookStore</Text>

        <FormField label="Email" value={email} onChangeText={setEmail} error={errors.email} keyboardType="email-address" />

        {/* Ô mật khẩu + nút 👁 ngay cạnh (câu hỏi bổ sung số 5) */}
        <View style={styles.passwordRow}>
          <View style={{ flex: 1 }}>
            <FormField label="Mật khẩu" value={password} onChangeText={setPassword} error={errors.password} secureTextEntry={!showPassword} />
          </View>
          <Pressable
            style={styles.eye}
            onPress={() => setShowPassword((v) => !v)}
            hitSlop={8}
            accessibilityLabel={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          >
            <Text style={[styles.eyeText, !showPassword && { opacity: 0.45 }]}>👁</Text>
          </Pressable>
        </View>

        {/* dòng lỗi chung: style={styles.submitError} đã có sẵn */}
        {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}
        <PrimaryButton title="Đăng nhập" onPress={submit} loading={loading} />

        <Pressable onPress={() => navigation.replace("Register", route.params)}>
          <Text style={styles.link}>Chưa có tài khoản? Đăng ký</Text>
        </Pressable>
        <View style={styles.hint}>
          <Text style={styles.hintText}>Tài khoản demo: demo@bookstore.vn / 123456</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 20, gap: 14 },
  logo: { fontSize: 56, textAlign: "center" },
  title: { fontSize: 22, fontWeight: "800", color: colors.navy, textAlign: "center", marginBottom: 6 },
  submitError: { color: colors.danger, textAlign: "center" },
  link: { color: colors.indigo, fontWeight: "700", textAlign: "center" },
  hint: { backgroundColor: "#E0F2FE", padding: 10, borderRadius: 10 },
  hintText: { color: colors.navy, textAlign: "center", fontSize: 12 },
  // marginTop 24 để nút 👁 nằm ngang hàng ô nhập (bỏ qua dòng nhãn "Mật khẩu" phía trên)
  passwordRow: { flexDirection: "row", alignItems: "flex-start", gap: 8 },
  eye: { marginTop: 24, width: 44, height: 44, borderRadius: 10, backgroundColor: "#fff", borderWidth: 1, borderColor: colors.line, alignItems: "center", justifyContent: "center" },
  eyeText: { fontSize: 20 },
});