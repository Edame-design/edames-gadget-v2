import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  login as loginRequest,
  register as registerRequest,
  type AuthUser,
} from "../lib/auth";

import {
  mergeGuestCartIntoAccount,
} from "../lib/cart";

type AuthContextValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;

  login: (
    email: string,
    password: string,
  ) => Promise<AuthUser>;

  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<AuthUser>;

  logout: () => void;

  updateUser: (
    user: AuthUser,
  ) => void;
};

const AuthContext =
  createContext<AuthContextValue | undefined>(
    undefined,
  );

const TOKEN_KEY =
  "edames_auth_token";

const USER_KEY =
  "edames_auth_user";

/**
 * Load the currently stored user
 * from localStorage.
 */
function getStoredUser(): AuthUser | null {
  try {
    const storedUser =
      localStorage.getItem(USER_KEY);

    if (!storedUser) {
      return null;
    }

    return JSON.parse(
      storedUser,
    ) as AuthUser;
  } catch {
    localStorage.removeItem(
      USER_KEY,
    );

    return null;
  }
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [token, setToken] =
    useState<string | null>(
      () =>
        localStorage.getItem(
          TOKEN_KEY,
        ),
    );

  const [user, setUser] =
    useState<AuthUser | null>(
      getStoredUser,
    );

  /**
   * Login an existing user.
   */
  async function login(
  email: string,
  password: string,
): Promise<AuthUser> {
  const result =
    await loginRequest(
      email,
      password,
    );

  /**
   * Store authentication first.
   *
   * This is important because the cart
   * merge requires the JWT token.
   */
  localStorage.setItem(
    TOKEN_KEY,
    result.token,
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(
      result.user,
    ),
  );

  setToken(result.token);
  setUser(result.user);

  /**
   * If the customer had a guest cart,
   * move it into their MongoDB cart.
   */
  try {
    await mergeGuestCartIntoAccount();
  } catch (error) {
    console.error(
      "Unable to merge guest cart:",
      error,
    );

    /**
     * Authentication itself succeeded.
     *
     * We deliberately do not log the
     * customer back out because the
     * cart merge can be retried.
     */
  }

  return result.user;
}

  /**
   * Register a new customer.
   */
  async function register(
  name: string,
  email: string,
  password: string,
): Promise<AuthUser> {
  const result =
    await registerRequest(
      name,
      email,
      password,
    );

  localStorage.setItem(
    TOKEN_KEY,
    result.token,
  );

  localStorage.setItem(
    USER_KEY,
    JSON.stringify(
      result.user,
    ),
  );

  setToken(result.token);
  setUser(result.user);

  /**
   * A newly registered customer can
   * also have a guest cart.
   *
   * Merge it into their new account.
   */
  try {
    await mergeGuestCartIntoAccount();
  } catch (error) {
    console.error(
      "Unable to merge guest cart:",
      error,
    );
  }

  return result.user;
}

  /**
   * Update the currently
   * authenticated user's profile.
   *
   * Used by Admin Settings when
   * the administrator changes
   * their name or email.
   */
  function updateUser(
    updatedUser: AuthUser,
  ) {
    localStorage.setItem(
      USER_KEY,
      JSON.stringify(
        updatedUser,
      ),
    );

    setUser(updatedUser);
  }

  /**
   * Log the current user out.
   */
  function logout() {
    localStorage.removeItem(
      TOKEN_KEY,
    );

    localStorage.removeItem(
      USER_KEY,
    );

    setToken(null);
    setUser(null);
  }

  /**
   * Values exposed to the
   * entire React application.
   */
  const value =
    useMemo(
      () => ({
        user,
        token,

        isAuthenticated:
          Boolean(
            token && user,
          ),

        isAdmin:
          user?.role ===
          "admin",

        login,
        register,
        logout,
        updateUser,
      }),
      [
        user,
        token,
      ],
    );

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Access the authentication
 * context from any component.
 */
export function useAuth() {
  const context =
    useContext(
      AuthContext,
    );

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider",
    );
  }

  return context;
}