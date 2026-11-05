# Trả lời câu hỏi bổ sung – Buổi 8

## 1. Cờ `ready`

Lần render đầu tiên, giỏ hàng trong store còn rỗng (`items = []`), còn dữ liệu cũ vẫn nằm trong AsyncStorage và đang được đọc bất đồng bộ.

Nếu `useAutoPersist` bỏ điều kiện `ready`, thứ tự sẽ là:

1. Render lần 1: store rỗng → effect chạy ngay → `saveJSON(key, [])` ghi mảng rỗng đè lên giỏ cũ.
2. `loadJSON` trả về kết quả nhưng dữ liệu cũ đã bị ghi đè thành `[]`, nên giỏ hàng đã lưu bị mất.

Cờ `ready` chỉ bật sau khi đọc xong và `dispatch(hydrate...)`, nên effect ghi chỉ chạy khi store đã chứa dữ liệu thật.

## 2. Token giả

Hai điểm không an toàn:

- Mật khẩu nằm sẵn dạng chữ thô trong `db.json` và được app tự so sánh ở phía client, nên ai tải dữ liệu về là thấy mật khẩu của mọi người.
- Token do app tự tạo nên ai cũng có thể làm giả token để giả danh người khác; server không có gì để xác minh.

Hệ thống thật: **server** kiểm tra mật khẩu (đã băm bằng bcrypt/argon2, không lưu mật khẩu thô) và cấp token có thời hạn (ví dụ JWT) đã ký. Ở app, token nên lưu bằng **SecureStore / Keychain (iOS) / Keystore (Android)** thay cho AsyncStorage, vì AsyncStorage không mã hóa.

## 3. Hai effect trong `CartItemRow`

Nếu xóa effect `setQty(item.quantity)`, state cục bộ `qty` chỉ lấy `item.quantity` ở lần render đầu rồi không theo dõi store nữa. Số hiển thị sẽ bị lệch so với store khi store đổi từ nơi khác, ví dụ:

- Mở app: giỏ được nạp từ AsyncStorage (`hydrateCart`) sau khi dòng đã render với số lượng mặc định.
- Thêm cùng một cuốn sách từ trang chi tiết (`addItem` làm tăng `quantity` trong store): dòng trong giỏ vẫn hiện số cũ.
- Giới hạn tồn kho trong store (`clamp`) làm số lượng bị chỉnh lại: nút vẫn hiện số người dùng đã bấm.

## 4. Một nguồn state

Nếu mỗi `HeartButton` giữ `useState` riêng, mỗi nút tim là một bản sao độc lập. Thả tim ở lưới thì chỉ state của nút đó đổi; vào trang chi tiết, nút tim mới mount với `useState(false)` nên vẫn trắng. Quay lại lưới có thể bị mất luôn trạng thái vì component bị mount lại, và màn Yêu thích không biết cuốn nào đã thả tim.

Với store (`wishlistSlice`), danh sách id chỉ nằm ở một nơi. Mọi `HeartButton` đều đọc `isFavorite(bookId)` từ cùng store và ghi qua `toggle(bookId)`, nên bấm ở đâu thì mọi nơi cập nhật theo, và `useAutoPersist` chỉ cần ghi một giá trị duy nhất.

## 5. Nút 👁 ẩn/hiện mật khẩu

File `src/screens/LoginScreen.tsx`:

```tsx
// state điều khiển ẩn/hiện (false = đang ẩn)
const [showPassword, setShowPassword] = useState(false);

// JSX: ô mật khẩu + nút 👁 đặt cạnh nhau
<View style={styles.passwordRow}>
  <View style={{ flex: 1 }}>
    <FormField
      label="Mật khẩu"
      value={password}
      onChangeText={setPassword}
      error={errors.password}
      secureTextEntry={!showPassword}   // hiện mật khẩu thì tắt secureTextEntry
    />
  </View>
  <Pressable
    style={styles.eye}
    onPress={() => setShowPassword((v) => !v)}   // bấm: đảo true/false
    accessibilityLabel={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
  >
    <Text style={[styles.eyeText, !showPassword && { opacity: 0.45 }]}>👁</Text>
  </Pressable>
</View>
```
