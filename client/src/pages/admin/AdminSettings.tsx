import {
  useState,
  type FormEvent,
} from "react";

import {
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Save,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import {
  changeAdminPassword,
  updateAdminProfile,
} from "../../lib/api";

import { useAuth } from "../../context/AuthContext";

import { AdminSidebar } from "../../components/admin/AdminSidebar";

export default function AdminSettings() {
  const {
    user,
    updateUser,
  } = useAuth();

  const [name, setName] = useState(
    user?.name || "",
  );

  const [email, setEmail] = useState(
    user?.email || "",
  );

  const [profileLoading, setProfileLoading] =
    useState(false);

  const [profileError, setProfileError] =
    useState("");

  const [profileSuccess, setProfileSuccess] =
    useState("");

  const [currentPassword, setCurrentPassword] =
    useState("");

  const [newPassword, setNewPassword] =
    useState("");

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

  const [
    passwordLoading,
    setPasswordLoading,
  ] = useState(false);

  const [
    passwordError,
    setPasswordError,
  ] = useState("");

  const [
    passwordSuccess,
    setPasswordSuccess,
  ] = useState("");

  async function handleProfileSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setProfileError("");
    setProfileSuccess("");

    const cleanName = name.trim();
    const cleanEmail =
      email.trim().toLowerCase();

    if (!cleanName || !cleanEmail) {
      setProfileError(
        "Name and email are required.",
      );
      return;
    }

    setProfileLoading(true);

    try {
      const updatedUser =
        await updateAdminProfile({
          name: cleanName,
          email: cleanEmail,
        });

      updateUser({
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: "admin",
      });

      setName(updatedUser.name);
      setEmail(updatedUser.email);

      setProfileSuccess(
        "Profile updated successfully.",
      );
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Unable to update profile.",
      );
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setPasswordError("");
    setPasswordSuccess("");

    if (!currentPassword) {
      setPasswordError(
        "Enter your current password.",
      );
      return;
    }

    if (newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters.",
      );
      return;
    }

    if (
      newPassword !== confirmPassword
    ) {
      setPasswordError(
        "New passwords do not match.",
      );
      return;
    }

    setPasswordLoading(true);

    try {
      await changeAdminPassword(
        currentPassword,
        newPassword,
      );

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setPasswordSuccess(
        "Password changed successfully.",
      );
    } catch (error) {
      setPasswordError(
        error instanceof Error
          ? error.message
          : "Unable to change password.",
      );
    } finally {
      setPasswordLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen flex-col lg:flex-row">
        <AdminSidebar />

        <main className="min-w-0 flex-1">
          <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <p className="text-sm font-medium text-blue-600">
                Administration
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                Settings
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Manage your administrator profile
                and account security.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              {/* Profile */}
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-6">
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                      <UserRound size={20} />
                    </div>

                    <div>
                      <h2 className="font-semibold text-slate-950">
                        Administrator profile
                      </h2>

                      <p className="text-sm text-slate-500">
                        Update your account details.
                      </p>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={
                    handleProfileSubmit
                  }
                  className="space-y-5 p-6"
                >
                  <div>
                    <label
                      htmlFor="admin-name"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Full name
                    </label>

                    <input
                      id="admin-name"
                      type="text"
                      value={name}
                      onChange={(event) =>
                        setName(
                          event.target.value,
                        )
                      }
                      maxLength={100}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="admin-email"
                      className="mb-2 block text-sm font-medium text-slate-700"
                    >
                      Email address
                    </label>

                    <input
                      id="admin-email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(
                          event.target.value,
                        )
                      }
                      maxLength={254}
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                    />
                  </div>

                  {profileError && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {profileError}
                    </div>
                  )}

                  {profileSuccess && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      <CheckCircle2
                        size={17}
                      />
                      {profileSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={profileLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Save size={17} />

                    {profileLoading
                      ? "Saving..."
                      : "Save changes"}
                  </button>
                </form>
              </section>

              {/* Security */}
              <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 p-6">
                  <div className="flex items-center gap-3">
                    <div className="grid size-11 place-items-center rounded-xl bg-emerald-50 text-emerald-600">
                      <ShieldCheck
                        size={20}
                      />
                    </div>

                    <div>
                      <h2 className="font-semibold text-slate-950">
                        Account security
                      </h2>

                      <p className="text-sm text-slate-500">
                        Change your administrator password.
                      </p>
                    </div>
                  </div>
                </div>

                <form
                  onSubmit={
                    handlePasswordSubmit
                  }
                  className="space-y-5 p-6"
                >
                  <PasswordField
                    id="current-password"
                    label="Current password"
                    value={currentPassword}
                    onChange={
                      setCurrentPassword
                    }
                    visible={
                      showCurrentPassword
                    }
                    onToggle={() =>
                      setShowCurrentPassword(
                        (value) => !value,
                      )
                    }
                  />

                  <PasswordField
                    id="new-password"
                    label="New password"
                    value={newPassword}
                    onChange={setNewPassword}
                    visible={showNewPassword}
                    onToggle={() =>
                      setShowNewPassword(
                        (value) => !value,
                      )
                    }
                  />

                  <PasswordField
                    id="confirm-password"
                    label="Confirm new password"
                    value={confirmPassword}
                    onChange={
                      setConfirmPassword
                    }
                    visible={
                      showConfirmPassword
                    }
                    onToggle={() =>
                      setShowConfirmPassword(
                        (value) => !value,
                      )
                    }
                  />

                  <div className="flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
                    <KeyRound
                      size={17}
                      className="mt-0.5 shrink-0 text-slate-500"
                    />

                    <p className="text-xs leading-5 text-slate-500">
                      Your new password must contain
                      at least 8 characters. Your
                      current password is required
                      before the change is accepted.
                    </p>
                  </div>

                  {passwordError && (
                    <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {passwordError}
                    </div>
                  )}

                  {passwordSuccess && (
                    <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      <CheckCircle2
                        size={17}
                      />
                      {passwordSuccess}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <ShieldCheck
                      size={17}
                    />

                    {passwordLoading
                      ? "Changing..."
                      : "Change password"}
                  </button>
                </form>
              </section>
            </div>

            {/* Account information */}
            <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-semibold text-slate-950">
                    Account information
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Your administrator permissions
                    are controlled by the server.
                  </p>
                </div>

                <div className="inline-flex w-fit items-center rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Administrator
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}

type PasswordFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (
    value: string,
  ) => void;
  visible: boolean;
  onToggle: () => void;
};

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
}: PasswordFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={
            visible
              ? "text"
              : "password"
          }
          value={value}
          onChange={(event) =>
            onChange(
              event.target.value,
            )
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 pr-12 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
          aria-label={
            visible
              ? "Hide password"
              : "Show password"
          }
        >
          {visible ? (
            <EyeOff size={18} />
          ) : (
            <Eye size={18} />
          )}
        </button>
      </div>
    </div>
  );
}