import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import { setCredentials } from "../store/authSlice";
import { hydrateCart } from "../store/cartSlice";
import { hydrateWishlist } from "../store/wishlistSlice";
import { clearAuth, loadAuth, saveAuth } from "../storage/authStorage"; // đã viết sẵn
import { loadJSON } from "../storage/storage"; // đã viết sẵn
import { useAutoPersist } from "./useAutoPersist";
import { CartItem } from "../types"; // dùng khi đọc loadJSON<CartItem[]>

export const CART_KEY = "@bookstore/cart";
export const WISHLIST_KEY = "@bookstore/wishlist";

// Mở app → nạp dữ liệu đã lưu; sau đó mọi thay đổi tự ghi lại. App.tsx chỉ hiện màn hình chính khi ready = true.
export function usePersistence() {
  const dispatch = useAppDispatch();
  const [ready, setReady] = useState(false);
  const user = useAppSelector((s) => s.auth.user);
  const token = useAppSelector((s) => s.auth.token);
  const cartItems = useAppSelector((s) => s.cart.items);
  const wishlistIds = useAppSelector((s) => s.wishlist.ids);

  useEffect(() => {
    (async () => {
      // BT8.3 (auto-login) ✔: const auth = await loadAuth(); nếu có token + user → dispatch(setCredentials(auth))
      // BT8.7b (giỏ hàng + yêu thích) ✔: đọc loadJSON<CartItem[]>(CART_KEY) và loadJSON<number[]>(WISHLIST_KEY)
      //   rồi dispatch(hydrateCart(...)) / dispatch(hydrateWishlist(...)). Gợi ý: dùng Promise.all để đọc 3 thứ song song.
      const [auth, cart, wish] = await Promise.all([
        loadAuth(),
        loadJSON<CartItem[]>(CART_KEY),
        loadJSON<number[]>(WISHLIST_KEY),
      ]);
      if (auth?.token && auth.user) dispatch(setCredentials(auth)); // BT8.3: khôi phục phiên đăng nhập
      if (cart) dispatch(hydrateCart(cart)); // BT8.7b: khôi phục giỏ hàng
      if (wish) dispatch(hydrateWishlist(wish)); // BT8.7b: khôi phục yêu thích
      setReady(true); // đọc xong hết mới bật cờ ready → các effect ghi bên dưới mới được chạy
    })();
  }, [dispatch]);

  useEffect(() => {
    if (!ready) return;
    // BT8.3 ✔: có user + token → saveAuth({ user, token }); ngược lại (đã đăng xuất) → clearAuth()
    if (user && token) saveAuth({ user, token });
    else clearAuth();
  }, [ready, user, token]);

  // BT8.7b ✔: gọi useAutoPersist(CART_KEY, cartItems, ready) và useAutoPersist(WISHLIST_KEY, wishlistIds, ready)
  useAutoPersist(CART_KEY, cartItems, ready);
  useAutoPersist(WISHLIST_KEY, wishlistIds, ready);

  return ready;
}