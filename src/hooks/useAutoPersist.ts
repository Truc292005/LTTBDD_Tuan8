import { useEffect } from "react";
import { saveJSON } from "../storage/storage";

// HOOK CHUNG: mỗi khi `value` đổi (và đã nạp xong dữ liệu cũ) → tự ghi vào AsyncStorage.
// Dùng cho cart, wishlist… — không phải viết lại effect ở từng nơi.
export function useAutoPersist<T>(key: string, value: T, ready: boolean) {
  // BT8.7b ✔: viết useEffect — nếu ready thì saveJSON(key, value); phụ thuộc [key, value, ready]
  //   Vì sao cần cờ ready? (xem câu hỏi bổ sung trong tài liệu)
  useEffect(() => {
    // Chưa ready = chưa đọc xong dữ liệu cũ. Lúc này giỏ/yêu thích trong store còn rỗng,
    // nếu ghi ngay thì mảng rỗng sẽ đè mất dữ liệu đã lưu.
    if (ready) saveJSON(key, value);
  }, [key, value, ready]);
}