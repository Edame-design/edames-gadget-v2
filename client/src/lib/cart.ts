import type { Product } from "./api";

import {
  getCart as getServerCart,
  addCartItem,
  updateCartItem as updateServerCartItem,
  removeCartItem as removeServerCartItem,
  clearCart as clearServerCart,
  type Cart as ServerCart,
} from "./api";

export type CartItem = Product & {
  quantity: number;
};

const KEY = "edames-cart-v2";

/**
 * ------------------------------------------------------------
 * GUEST CART
 * ------------------------------------------------------------
 */

function getGuestCart(): CartItem[] {
  try {
    const stored =
      localStorage.getItem(KEY);

    if (!stored) {
      return [];
    }

    const parsed =
      JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      localStorage.removeItem(KEY);
      return [];
    }

    return parsed.filter(
      (item): item is CartItem =>
        Boolean(
          item &&
            typeof item === "object" &&
            typeof item._id === "string" &&
            typeof item.name === "string" &&
            typeof item.price === "number" &&
            typeof item.quantity === "number" &&
            item.quantity > 0,
        ),
    );
  } catch {
    localStorage.removeItem(KEY);
    return [];
  }
}

function saveGuestCart(
  items: CartItem[],
) {
  if (!Array.isArray(items)) {
    return;
  }

  localStorage.setItem(
    KEY,
    JSON.stringify(items),
  );
}

export function clearGuestCart() {
  localStorage.removeItem(KEY);
}

/**
 * ------------------------------------------------------------
 * SERVER CART
 * ------------------------------------------------------------
 */

function isProduct(
  value: unknown,
): value is Product {
  if (
    !value ||
    typeof value !== "object"
  ) {
    return false;
  }

  const product =
    value as Partial<Product>;

  return (
    typeof product._id === "string" &&
    typeof product.name === "string" &&
    typeof product.price === "number"
  );
}

export function mapServerCart(
  cart: ServerCart,
): CartItem[] {
  if (
    !cart ||
    !Array.isArray(cart.items)
  ) {
    return [];
  }

  return cart.items
    .map((item) => {
      if (
        !isProduct(
          item.productId,
        )
      ) {
        return null;
      }

      const product =
        item.productId;

      return {
        ...product,
        quantity:
          item.quantity,
      };
    })
    .filter(
      (
        item,
      ): item is CartItem =>
        item !== null,
    );
}

/**
 * ------------------------------------------------------------
 * AUTH
 * ------------------------------------------------------------
 */

function isAuthenticated(): boolean {
  return Boolean(
    localStorage.getItem(
      "edames_auth_token",
    ),
  );
}

/**
 * ------------------------------------------------------------
 * CART EVENTS
 * ------------------------------------------------------------
 */

export function notifyCartChanged() {
  window.dispatchEvent(
    new Event("cart:changed"),
  );
}

/**
 * ------------------------------------------------------------
 * GET CART
 * ------------------------------------------------------------
 */

export async function getCart(): Promise<CartItem[]> {
  if (!isAuthenticated()) {
    return getGuestCart();
  }

  const serverCart =
    await getServerCart();

  return mapServerCart(
    serverCart,
  );
}

/**
 * ------------------------------------------------------------
 * ADD TO CART
 * ------------------------------------------------------------
 */

export async function addToCart(
  product: Product,
  quantity = 1,
): Promise<CartItem[]> {
  if (quantity < 1) {
    return getCart();
  }

  if (!isAuthenticated()) {
    const items =
      getGuestCart();

    const existingItem =
      items.find(
        (item) =>
          item._id ===
          product._id,
      );

    if (existingItem) {
      existingItem.quantity +=
        quantity;
    } else {
      items.push({
        ...product,
        quantity,
      });
    }

    saveGuestCart(items);

    notifyCartChanged();

    return items;
  }

  const serverCart =
    await addCartItem(
      product._id,
      quantity,
    );

  const items =
    mapServerCart(
      serverCart,
    );

  notifyCartChanged();

  return items;
}

/**
 * ------------------------------------------------------------
 * MERGE GUEST CART INTO CUSTOMER CART
 * ------------------------------------------------------------
 */

export async function mergeGuestCartIntoAccount(): Promise<CartItem[]> {
  const guestItems =
    getGuestCart();

  if (guestItems.length === 0) {
    const serverCart =
      await getServerCart();

    return mapServerCart(
      serverCart,
    );
  }

  for (const item of guestItems) {
    await addCartItem(
      item._id,
      item.quantity,
    );
  }

  clearGuestCart();

  const mergedCart =
    await getServerCart();

  const items =
    mapServerCart(
      mergedCart,
    );

  notifyCartChanged();

  return items;
}

/**
 * ------------------------------------------------------------
 * UPDATE CART ITEM
 * ------------------------------------------------------------
 */

export async function updateCartItem(
  id: string,
  quantity: number,
): Promise<CartItem[]> {
  if (quantity < 1) {
    return getCart();
  }

  if (!isAuthenticated()) {
    const items =
      getGuestCart()
        .map((item) =>
          item._id === id
            ? {
                ...item,
                quantity,
              }
            : item,
        )
        .filter(
          (item) =>
            item.quantity > 0,
        );

    saveGuestCart(items);

    notifyCartChanged();

    return items;
  }

  const serverCart =
    await updateServerCartItem(
      id,
      quantity,
    );

  const items =
    mapServerCart(
      serverCart,
    );

  notifyCartChanged();

  return items;
}

/**
 * ------------------------------------------------------------
 * REMOVE CART ITEM
 * ------------------------------------------------------------
 */

export async function removeFromCart(
  id: string,
): Promise<CartItem[]> {
  if (!isAuthenticated()) {
    const items =
      getGuestCart().filter(
        (item) =>
          item._id !== id,
      );

    saveGuestCart(items);

    notifyCartChanged();

    return items;
  }

  const serverCart =
    await removeServerCartItem(
      id,
    );

  const items =
    mapServerCart(
      serverCart,
    );

  notifyCartChanged();

  return items;
}

/**
 * ------------------------------------------------------------
 * CLEAR CART
 * ------------------------------------------------------------
 */

export async function clearCart(): Promise<CartItem[]> {
  if (!isAuthenticated()) {
    clearGuestCart();

    notifyCartChanged();

    return [];
  }

  await clearServerCart();

  notifyCartChanged();

  return [];
}

/**
 * ------------------------------------------------------------
 * CART COUNT
 * ------------------------------------------------------------
 */

export function cartCount(
  items: CartItem[] = getGuestCart(),
): number {
  if (!Array.isArray(items)) {
    return 0;
  }

  return items.reduce(
    (total, item) =>
      total + item.quantity,
    0,
  );
}

/**
 * ------------------------------------------------------------
 * CART TOTAL
 * ------------------------------------------------------------
 */

export function cartTotal(
  items: CartItem[] = getGuestCart(),
): number {
  if (!Array.isArray(items)) {
    return 0;
  }

  return items.reduce(
    (total, item) =>
      total +
      Number(item.price || 0) *
        item.quantity,
    0,
  );
}

/**
 * ------------------------------------------------------------
 * CHECK WHETHER A GUEST CART EXISTS
 * ------------------------------------------------------------
 */

export function hasGuestCart(): boolean {
  return getGuestCart().length > 0;
}