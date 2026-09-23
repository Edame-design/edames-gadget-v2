export type Product = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  image?: string;
  category: string;
  stock: number;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Category = {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

/*
|--------------------------------------------------------------------------
| CART TYPES
|--------------------------------------------------------------------------
*/

export type CartItem = {
  productId: string;
  quantity: number;
  product?: Product;
};

export type Cart = {
  _id: string;
  userId: string;
  items: CartItem[];
  createdAt?: string;
  updatedAt?: string;
};

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:10000/api";

async function request<T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> {
  const token =
    localStorage.getItem(
      "edames_auth_token",
    );

  const response = await fetch(
    `${API_BASE_URL}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type":
          "application/json",

        ...(token
          ? {
              Authorization: `Bearer ${token}`,
            }
          : {}),

        ...(options?.headers || {}),
      },
    },
  );

  if (!response.ok) {
    let message =
      "Something went wrong";

    try {
      const data =
        await response.json();

      if (data?.message) {
        message = data.message;
      }
    } catch {
      // Keep the default error message.
    }

    throw new Error(message);
  }

  return response.json();
}

/*
|--------------------------------------------------------------------------
| PRODUCTS
|--------------------------------------------------------------------------
*/

export async function getProducts(): Promise<
  Product[]
> {
  return request<Product[]>(
    "/products",
  );
}

export async function getAdminProducts(): Promise<
  Product[]
> {
  return request<Product[]>(
    "/products/admin/all",
  );
}

export async function createProduct(
  product: Omit<
    Product,
    "_id" | "createdAt" | "updatedAt"
  >,
): Promise<Product> {
  return request<Product>(
    "/products",
    {
      method: "POST",
      body: JSON.stringify(product),
    },
  );
}

export async function updateProduct(
  id: string,
  product: Partial<
    Omit<
      Product,
      "_id" | "createdAt" | "updatedAt"
    >
  >,
): Promise<Product> {
  return request<Product>(
    `/products/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(product),
    },
  );
}

export async function deleteProduct(
  id: string,
): Promise<Product> {
  return request<Product>(
    `/products/${id}`,
    {
      method: "DELETE",
    },
  );
}

export async function getProduct(
  id: string,
): Promise<Product> {
  return request<Product>(
    `/products/${id}`,
  );
}

/*
|--------------------------------------------------------------------------
| ASSETS
|--------------------------------------------------------------------------
*/

export const asset = (
  image?: string,
) => {
  if (!image) {
    return "/products/image1.jpg";
  }

  const trimmedImage =
    image.trim();

  if (!trimmedImage) {
    return "/products/image1.jpg";
  }

  if (
    trimmedImage.startsWith(
      "http://",
    ) ||
    trimmedImage.startsWith(
      "https://",
    ) ||
    trimmedImage.startsWith("data:")
  ) {
    return trimmedImage;
  }

  if (
    trimmedImage.startsWith(
      "/products/",
    )
  ) {
    return trimmedImage;
  }

  if (
    trimmedImage.startsWith(
      "products/",
    )
  ) {
    return `/${trimmedImage}`;
  }

  return `/products/${encodeURIComponent(
    trimmedImage,
  )}`;
};

/*
|--------------------------------------------------------------------------
| CATEGORIES
|--------------------------------------------------------------------------
*/

export async function getCategories(): Promise<
  Category[]
> {
  return request<Category[]>(
    "/categories",
  );
}

export async function getAdminCategories(): Promise<
  Category[]
> {
  return request<Category[]>(
    "/categories/admin/all",
  );
}

export async function createCategory(
  category: {
    name: string;
    slug: string;
    description?: string;
  },
): Promise<Category> {
  return request<Category>(
    "/categories",
    {
      method: "POST",
      body: JSON.stringify(
        category,
      ),
    },
  );
}

export async function updateCategory(
  id: string,
  category: Partial<
    Omit<
      Category,
      "_id" | "createdAt" | "updatedAt"
    >
  >,
): Promise<Category> {
  return request<Category>(
    `/categories/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(
        category,
      ),
    },
  );
}

export async function deleteCategory(
  id: string,
): Promise<Category> {
  return request<Category>(
    `/categories/${id}`,
    {
      method: "DELETE",
    },
  );
}

/*
|--------------------------------------------------------------------------
| CART
|--------------------------------------------------------------------------
*/

export async function getCart(): Promise<Cart> {
  return request<Cart>("/cart");
}

export async function addCartItem(
  productId: string,
  quantity = 1,
): Promise<Cart> {
  return request<Cart>(
    "/cart/items",
    {
      method: "POST",
      body: JSON.stringify({
        productId,
        quantity,
      }),
    },
  );
}

export async function updateCartItem(
  productId: string,
  quantity: number,
): Promise<Cart> {
  return request<Cart>(
    `/cart/items/${productId}`,
    {
      method: "PUT",
      body: JSON.stringify({
        quantity,
      }),
    },
  );
}

export async function removeCartItem(
  productId: string,
): Promise<Cart> {
  return request<Cart>(
    `/cart/items/${productId}`,
    {
      method: "DELETE",
    },
  );
}

export async function clearCart(): Promise<Cart> {
  return request<Cart>(
    "/cart",
    {
      method: "DELETE",
    },
  );
}

/*
|--------------------------------------------------------------------------
| ORDERS
|--------------------------------------------------------------------------
*/

export type OrderItem = {
  productId: string;
  name: string;
  image?: string;
  price: number;
  quantity: number;
  subtotal: number;
};

export type ShippingAddress = {
  fullName: string;
  phone: string;
  address: string;
  city: string;
  state: string;
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export type PaymentStatus =
  | "pending"
  | "paid"
  | "failed"
  | "refunded";

export type PaymentMethod =
  | "cash_on_delivery"
  | "bank_transfer"
  | "online";

/*
|--------------------------------------------------------------------------
| DELIVERY TYPES
|--------------------------------------------------------------------------
*/

export type DeliveryMethod =
  | "pickup"
  | "delivery";

export type DeliveryFeeStatus =
  | "not_required"
  | "estimated"
  | "quote_required"
  | "quoted"
  | "finalized";

export type DeliveryPaymentStatus =
  | "not_required"
  | "pending"
  | "paid"
  | "refunded";

export type Order = {
  _id: string;

  userId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };

  items: OrderItem[];

  subtotal: number;

  shippingFee: number;

  total: number;

  status: OrderStatus;

  paymentStatus: PaymentStatus;

  paymentMethod: PaymentMethod;

  deliveryMethod: DeliveryMethod;

  deliveryState: string | null;

  deliveryCity: string | null;

  deliveryZoneId: string | null;

  estimatedDeliveryFee: number;

  quotedDeliveryFee: number | null;

  finalDeliveryFee: number;

  deliveryFeeStatus: DeliveryFeeStatus;

  deliveryPaymentStatus: DeliveryPaymentStatus;

  shippingAddress?: ShippingAddress;

  createdAt?: string;

  updatedAt?: string;
};

export type CreateOrderInput = {
  items: {
    productId: string;
    quantity: number;
  }[];

  shippingAddress?: ShippingAddress;

  paymentMethod?: PaymentMethod;

  deliveryMethod: DeliveryMethod;
};

export async function createOrder(
  order: CreateOrderInput,
): Promise<Order> {
  const response = await request<{
    message?: string;
    order?: Order;
    data?: {
      order?: Order;
    };
  }>("/orders", {
    method: "POST",
    body: JSON.stringify(order),
  });

  const createdOrder =
    response?.order ??
    response?.data?.order ??
    (response as unknown as Order);

  if (!createdOrder?._id) {
    console.error(
      "Unexpected createOrder response:",
      response,
    );

    throw new Error(
      "Order was created, but the server did not return a valid order.",
    );
  }

  return createdOrder;
}

export async function getMyOrders(): Promise<
  Order[]
> {
  return request<Order[]>(
    "/orders/my",
  );
}

export async function getMyOrder(
  id: string,
): Promise<Order> {
  return request<Order>(
    `/orders/my/${id}`,
  );
}

export async function getAdminOrders(): Promise<
  Order[]
> {
  return request<Order[]>(
    "/orders/admin/all",
  );
}

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
): Promise<Order> {
  const response =
    await request<{
      message: string;
      order: Order;
    }>(
      `/orders/admin/${id}/status`,
      {
        method: "PUT",
        body: JSON.stringify({
          status,
        }),
      },
    );

  return response.order;
}

/*
|--------------------------------------------------------------------------
| CUSTOMERS
|--------------------------------------------------------------------------
*/

export type Customer = {
  _id: string;
  name: string;
  email: string;
  role: "customer" | "admin";
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export async function getAdminCustomers(): Promise<
  Customer[]
> {
  return request<Customer[]>(
    "/users/admin/all",
  );
}

export async function updateCustomerStatus(
  id: string,
  isActive: boolean,
): Promise<Customer> {
  const response =
    await request<{
      message: string;
      user: Customer;
    }>(
      `/users/admin/${id}/status`,
      {
        method: "PUT",
        body: JSON.stringify({
          isActive,
        }),
      },
    );

  return response.user;
}

/*
|--------------------------------------------------------------------------
| ANALYTICS
|--------------------------------------------------------------------------
*/

export type AnalyticsOverview = {
  revenue: number;
  orders: number;
  customers: number;
  products: number;
  unitsSold: number;
};

export type AnalyticsOrderStatuses = {
  pending: number;
  confirmed: number;
  processing: number;
  shipped: number;
  delivered: number;
  cancelled: number;
};

export type AnalyticsRecentOrder = {
  _id: string;
  total: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  createdAt?: string;
  items: OrderItem[];

  userId:
    | string
    | {
        _id: string;
        name: string;
        email: string;
      };
};

export type AnalyticsTopProduct = {
  _id: string;
  name: string;
  unitsSold: number;
  revenue: number;
};

export type AdminAnalytics = {
  overview: AnalyticsOverview;
  orderStatuses: AnalyticsOrderStatuses;
  recentOrders: AnalyticsRecentOrder[];
  topProducts: AnalyticsTopProduct[];
};

export async function getAdminAnalytics(): Promise<AdminAnalytics> {
  return request<AdminAnalytics>(
    "/analytics/admin/overview",
  );
}

/*
|--------------------------------------------------------------------------
| ADMIN PROFILE
|--------------------------------------------------------------------------
*/

export type AdminProfile = {
  id: string;
  name: string;
  email: string;
  role: "admin";
};

export async function updateAdminProfile(
  data: {
    name: string;
    email: string;
  },
): Promise<AdminProfile> {
  const response =
    await request<{
      message: string;
      user: AdminProfile;
    }>(
      "/users/admin/me",
      {
        method: "PUT",
        body: JSON.stringify(data),
      },
    );

  return response.user;
}

export async function changeAdminPassword(
  currentPassword: string,
  newPassword: string,
): Promise<{
  message: string;
}> {
  return request<{
    message: string;
  }>(
    "/users/admin/me/password",
    {
      method: "PUT",
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    },
  );
}

/*
|--------------------------------------------------------------------------
| CUSTOMER ACCOUNT
|--------------------------------------------------------------------------
*/

export async function changeCustomerPassword(
  currentPassword: string,
  newPassword: string,
): Promise<{
  message: string;
}> {
  return request<{
    message: string;
  }>(
    "/account/password",
    {
      method: "PUT",
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    },
  );
}

/*
|--------------------------------------------------------------------------
| DELIVERY PRICING
|--------------------------------------------------------------------------
*/

export type DeliveryPricingType =
  | "state"
  | "city";

export type DeliveryZone = {
  _id: string;

  type: DeliveryPricingType;

  state: string;

  city: string | null;

  fee: number;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;
};

export type DeliveryQuote = {
  status:
    | "estimated"
    | "quote_required";

  source:
    | "state"
    | "city"
    | "manual";

  fee: number;

  state: string;

  city: string;

  zoneId: string | null;
};

export type CreateDeliveryZoneInput = {
  type: DeliveryPricingType;

  state: string;

  city?: string;

  fee: number;
};

export type UpdateDeliveryZoneInput = {
  fee?: number;

  isActive?: boolean;
};

export async function getDeliveryQuote(
  state: string,
  city: string,
): Promise<DeliveryQuote> {
  const params = new URLSearchParams({
    state,
    city,
  });

  return request<DeliveryQuote>(
    `/delivery/quote?${params.toString()}`,
  );
}

export async function getAdminDeliveryZones(): Promise<
  DeliveryZone[]
> {
  return request<DeliveryZone[]>(
    "/delivery/admin",
  );
}

export async function createDeliveryZone(
  data: CreateDeliveryZoneInput,
): Promise<{
  message: string;
  zone: DeliveryZone;
}> {
  return request<{
    message: string;
    zone: DeliveryZone;
  }>("/delivery/admin", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateDeliveryZone(
  id: string,
  data: UpdateDeliveryZoneInput,
): Promise<{
  message: string;
  zone: DeliveryZone;
}> {
  return request<{
    message: string;
    zone: DeliveryZone;
  }>(`/delivery/admin/${id}`, {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function deleteDeliveryZone(
  id: string,
): Promise<{
  message: string;
}> {
  return request<{
    message: string;
  }>(`/delivery/admin/${id}`, {
    method: "DELETE",
  });
}

/*
|--------------------------------------------------------------------------
| WISHLIST
|--------------------------------------------------------------------------
*/

export type WishlistResponse = {
  products: Product[];
};

export type WishlistCheckResponse = {
  isWishlisted: boolean;
};

export async function getWishlist(): Promise<WishlistResponse> {
  return request<WishlistResponse>(
    "/wishlist",
    {
      method: "GET",
    },
  );
}

export async function addToWishlist(
  productId: string,
): Promise<WishlistResponse> {
  return request<WishlistResponse>(
    `/wishlist/${productId}`,
    {
      method: "POST",
    },
  );
}

export async function removeFromWishlist(
  productId: string,
): Promise<WishlistResponse> {
  return request<WishlistResponse>(
    `/wishlist/${productId}`,
    {
      method: "DELETE",
    },
  );
}

export async function checkWishlist(
  productId: string,
): Promise<WishlistCheckResponse> {
  return request<WishlistCheckResponse>(
    `/wishlist/${productId}/check`,
    {
      method: "GET",
    },
  );
}