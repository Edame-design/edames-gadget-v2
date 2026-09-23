import {
  addToWishlist as addServerWishlist,
  getWishlist as getServerWishlist,
  removeFromWishlist as removeServerWishlist,
  type Product,
} from "./api";

/*
|--------------------------------------------------------------------------
| STORAGE
|--------------------------------------------------------------------------
*/

const WISHLIST_STORAGE_KEY =
  "edames-wishlist-v2";

/*
|--------------------------------------------------------------------------
| TYPES
|--------------------------------------------------------------------------
*/

export type WishlistItem = Product;

/*
|--------------------------------------------------------------------------
| LOCAL STORAGE HELPERS
|--------------------------------------------------------------------------
*/

function readLocalWishlist(): WishlistItem[] {
  try {
    const stored =
      localStorage.getItem(
        WISHLIST_STORAGE_KEY,
      );

    if (!stored) {
      return [];
    }

    const parsed: unknown =
      JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    /*
     * Keep only valid product-like
     * wishlist entries.
     */
    return parsed.filter(
      (
        product,
      ): product is WishlistItem =>
        typeof product === "object" &&
        product !== null &&
        "_id" in product &&
        typeof product._id === "string",
    );
  } catch (error) {
    console.error(
      "Unable to read wishlist:",
      error,
    );

    return [];
  }
}

function writeLocalWishlist(
  products: WishlistItem[],
): void {
  try {
    localStorage.setItem(
      WISHLIST_STORAGE_KEY,
      JSON.stringify(products),
    );
  } catch (error) {
    console.error(
      "Unable to save wishlist:",
      error,
    );
  }
}

/*
|--------------------------------------------------------------------------
| GUEST WISHLIST
|--------------------------------------------------------------------------
*/

export function getGuestWishlist(): WishlistItem[] {
  return readLocalWishlist();
}

export function isGuestWishlisted(
  productId: string,
): boolean {
  return readLocalWishlist().some(
    (product: WishlistItem) =>
      product._id === productId,
  );
}

export function addToGuestWishlist(
  product: WishlistItem,
): WishlistItem[] {
  const current =
    readLocalWishlist();

  const alreadyExists =
    current.some(
      (item: WishlistItem) =>
        item._id === product._id,
    );

  if (alreadyExists) {
    return current;
  }

  const updated: WishlistItem[] = [
    ...current,
    product,
  ];

  writeLocalWishlist(updated);

  return updated;
}

export function removeFromGuestWishlist(
  productId: string,
): WishlistItem[] {
  const current =
    readLocalWishlist();

  const updated =
    current.filter(
      (product: WishlistItem) =>
        product._id !== productId,
    );

  writeLocalWishlist(updated);

  return updated;
}

export function clearGuestWishlist(): void {
  try {
    localStorage.removeItem(
      WISHLIST_STORAGE_KEY,
    );
  } catch (error) {
    console.error(
      "Unable to clear wishlist:",
      error,
    );
  }
}

/*
|--------------------------------------------------------------------------
| UNIFIED WISHLIST
|--------------------------------------------------------------------------
*/

export async function getWishlist(
  isAuthenticated: boolean,
): Promise<WishlistItem[]> {
  if (!isAuthenticated) {
    return getGuestWishlist();
  }

  const response =
    await getServerWishlist();

  return response.products;
}

export async function isWishlisted(
  productId: string,
  isAuthenticated: boolean,
): Promise<boolean> {
  if (!isAuthenticated) {
    return isGuestWishlisted(
      productId,
    );
  }

  const wishlist =
    await getServerWishlist();

  return wishlist.products.some(
    (product: Product) =>
      product._id === productId,
  );
}

/*
|--------------------------------------------------------------------------
| ADD
|--------------------------------------------------------------------------
*/

export async function addToWishlist(
  product: WishlistItem,
  isAuthenticated: boolean,
): Promise<WishlistItem[]> {
  if (!isAuthenticated) {
    return addToGuestWishlist(
      product,
    );
  }

  const response =
    await addServerWishlist(
      product._id,
    );

  return response.products;
}

/*
|--------------------------------------------------------------------------
| REMOVE
|--------------------------------------------------------------------------
*/

export async function removeFromWishlist(
  productId: string,
  isAuthenticated: boolean,
): Promise<WishlistItem[]> {
  if (!isAuthenticated) {
    return removeFromGuestWishlist(
      productId,
    );
  }

  const response =
    await removeServerWishlist(
      productId,
    );

  return response.products;
}

/*
|--------------------------------------------------------------------------
| GUEST → ACCOUNT MERGE
|--------------------------------------------------------------------------
*/

export async function mergeGuestWishlistIntoAccount(): Promise<WishlistItem[]> {
  const guestWishlist =
    getGuestWishlist();

  /*
   * Nothing to merge.
   */
  if (
    guestWishlist.length === 0
  ) {
    const response =
      await getServerWishlist();

    return response.products;
  }

  let serverWishlist =
    await getServerWishlist();

  /*
   * Add each guest product to
   * the authenticated wishlist.
   *
   * The backend handles duplicates.
   */
  for (
    const product of guestWishlist
  ) {
    try {
      serverWishlist =
        await addServerWishlist(
          product._id,
        );
    } catch (error) {
      /*
       * Continue merging the remaining
       * products if one product is
       * unavailable.
       */
      console.error(
        `Unable to merge wishlist product ${product._id}:`,
        error,
      );
    }
  }

  /*
   * Clear the guest wishlist only
   * after the merge process finishes.
   */
  clearGuestWishlist();

  return serverWishlist.products;
}

/*
|--------------------------------------------------------------------------
| EVENTS
|--------------------------------------------------------------------------
*/

export function notifyWishlistChanged(): void {
  window.dispatchEvent(
    new Event(
      "wishlist:changed",
    ),
  );
}