import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  ShieldCheck,
} from "lucide-react";

import {
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import { changeCustomerPassword } from "../lib/api";

export default function AccountSettings() {
  const navigate = useNavigate();

  const [
    currentPassword,
    setCurrentPassword,
  ] = useState("");

  const [
    newPassword,
    setNewPassword,
  ] = useState("");

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState("");

  const [
    showCurrentPassword,
    setShowCurrentPassword,
  ] = useState(false);

  const [
    showNewPassword,
    setShowNewPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (
      !currentPassword ||
      !newPassword ||
      !confirmPassword
    ) {
      setError(
        "Please fill in all password fields.",
      );

      return;
    }

    if (newPassword.length < 8) {
      setError(
        "Your new password must be at least 8 characters.",
      );

      return;
    }

    if (
      newPassword !==
      confirmPassword
    ) {
      setError(
        "New passwords do not match.",
      );

      return;
    }

    if (
      currentPassword ===
      newPassword
    ) {
      setError(
        "Your new password must be different from your current password.",
      );

      return;
    }

    try {
      setIsSubmitting(true);

      const response =
        await changeCustomerPassword(
          currentPassword,
          newPassword,
        );

      setSuccess(
        response.message ||
          "Password changed successfully.",
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to change your password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="container-page py-8 sm:py-12">
        {/* Back */}
        <Link
          to="/account"
          className="
            inline-flex
            items-center
            gap-2
            text-sm
            font-semibold
            text-slate-600
            transition
            hover:text-blue-600
          "
        >
          <ArrowLeft size={17} />
          Back to account
        </Link>

        {/* Header */}
        <div className="mt-8 max-w-2xl">
          <p className="text-sm font-semibold text-blue-600">
            Account
          </p>

          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950">
            Account settings
          </h1>

          <p className="mt-2 text-sm leading-6 text-slate-500">
            Manage your account security and
            password.
          </p>
        </div>

        {/* Settings layout */}
        <div className="mt-8 grid max-w-5xl gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          {/* Security information */}
          <section className="rounded-2xl border border-slate-200 bg-slate-950 p-6 text-white shadow-sm sm:p-7">
            <div className="grid size-12 place-items-center rounded-2xl bg-blue-500/15 text-blue-300">
              <ShieldCheck size={24} />
            </div>

            <h2 className="mt-6 text-xl font-bold">
              Keep your account secure
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-300">
              Use a strong password that you do
              not reuse on other websites.
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex gap-3">
                <div className="mt-0.5 text-blue-300">
                  <CheckCircle2 size={17} />
                </div>

                <p className="text-sm text-slate-300">
                  Your password is securely
                  hashed before it is stored.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="mt-0.5 text-blue-300">
                  <CheckCircle2 size={17} />
                </div>

                <p className="text-sm text-slate-300">
                  Your current password must be
                  verified before changing it.
                </p>
              </div>

              <div className="flex gap-3">
                <div className="mt-0.5 text-blue-300">
                  <CheckCircle2 size={17} />
                </div>

                <p className="text-sm text-slate-300">
                  New passwords must contain at
                  least 8 characters.
                </p>
              </div>
            </div>
          </section>

          {/* Change password */}
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-3">
              <div className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <LockKeyhole size={21} />
              </div>

              <div>
                <h2 className="font-bold text-slate-950">
                  Change password
                </h2>

                <p className="text-xs text-slate-500">
                  Update your account password
                </p>
              </div>
            </div>

            {error && (
              <div className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div className="mt-6 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                {success}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5"
            >
              {/* Current password */}
              <div>
                <label
                  htmlFor="current-password"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Current password
                </label>

                <div className="relative">
                  <input
                    id="current-password"
                    type={
                      showCurrentPassword
                        ? "text"
                        : "password"
                    }
                    value={currentPassword}
                    onChange={(event) =>
                      setCurrentPassword(
                        event.target.value,
                      )
                    }
                    autoComplete="current-password"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      py-3
                      pr-12
                      text-sm
                      outline-none
                      transition
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                    disabled={isSubmitting}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowCurrentPassword(
                        (value) => !value,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label={
                      showCurrentPassword
                        ? "Hide current password"
                        : "Show current password"
                    }
                  >
                    {showCurrentPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              {/* New password */}
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  New password
                </label>

                <div className="relative">
                  <input
                    id="new-password"
                    type={
                      showNewPassword
                        ? "text"
                        : "password"
                    }
                    value={newPassword}
                    onChange={(event) =>
                      setNewPassword(
                        event.target.value,
                      )
                    }
                    autoComplete="new-password"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      py-3
                      pr-12
                      text-sm
                      outline-none
                      transition
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                    disabled={isSubmitting}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowNewPassword(
                        (value) => !value,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label={
                      showNewPassword
                        ? "Hide new password"
                        : "Show new password"
                    }
                  >
                    {showNewPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>

                <p className="mt-2 text-xs text-slate-400">
                  Use at least 8 characters.
                </p>
              </div>

              {/* Confirm password */}
              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-semibold text-slate-800"
                >
                  Confirm new password
                </label>

                <div className="relative">
                  <input
                    id="confirm-password"
                    type={
                      showConfirmPassword
                        ? "text"
                        : "password"
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value,
                      )
                    }
                    autoComplete="new-password"
                    className="
                      w-full
                      rounded-xl
                      border
                      border-slate-200
                      bg-white
                      px-4
                      py-3
                      pr-12
                      text-sm
                      outline-none
                      transition
                      focus:border-blue-500
                      focus:ring-4
                      focus:ring-blue-500/10
                    "
                    disabled={isSubmitting}
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(
                        (value) => !value,
                      )
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
                    aria-label={
                      showConfirmPassword
                        ? "Hide password confirmation"
                        : "Show password confirmation"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="
                  w-full
                  rounded-xl
                  bg-slate-950
                  px-5
                  py-3.5
                  text-sm
                  font-semibold
                  text-white
                  transition
                  hover:bg-blue-600
                  disabled:cursor-not-allowed
                  disabled:opacity-60
                "
              >
                {isSubmitting
                  ? "Changing password..."
                  : "Change password"}
              </button>
            </form>
          </section>
        </div>
      </div>
    </main>
  );
}