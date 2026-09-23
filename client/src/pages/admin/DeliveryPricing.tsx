import {
  Check,
  Edit3,
  MapPin,
  Plus,
  Save,
  Trash2,
  Truck,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  createDeliveryZone,
  deleteDeliveryZone,
  getAdminDeliveryZones,
  updateDeliveryZone,
  type DeliveryPricingType,
  type DeliveryZone,
} from "../../lib/api";

import { AdminSidebar } from "../../components/admin/AdminSidebar";


function formatPrice(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-NG",
    {
      style: "currency",
      currency: "NGN",
      maximumFractionDigits: 0,
    },
  ).format(value);
}


export default function DeliveryPricing() {
  const [
    zones,
    setZones,
  ] = useState<DeliveryZone[]>([]);

  const [
    isLoading,
    setIsLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    success,
    setSuccess,
  ] = useState("");

  const [
    showAddForm,
    setShowAddForm,
  ] = useState(false);

  const [
    editingId,
    setEditingId,
  ] = useState<string | null>(
    null,
  );

  const [
    editFee,
    setEditFee,
  ] = useState("");

  const [
    newType,
    setNewType,
  ] = useState<DeliveryPricingType>(
    "state",
  );

  const [
    newState,
    setNewState,
  ] = useState("");

  const [
    newCity,
    setNewCity,
  ] = useState("");

  const [
    newFee,
    setNewFee,
  ] = useState("");

  const [
    isSaving,
    setIsSaving,
  ] = useState(false);


  const loadZones =
    async () => {
      try {
        setIsLoading(true);
        setError("");

        const data =
          await getAdminDeliveryZones();

        setZones(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load delivery pricing.",
        );
      } finally {
        setIsLoading(false);
      }
    };


  useEffect(() => {
    loadZones();
  }, []);


  const stateZones =
    useMemo(
      () =>
        zones.filter(
          (zone) =>
            zone.type === "state",
        ),
      [zones],
    );


  const cityZones =
    useMemo(
      () =>
        zones.filter(
          (zone) =>
            zone.type === "city",
        ),
      [zones],
    );


  const resetMessages =
    () => {
      setError("");
      setSuccess("");
    };


  const resetAddForm =
    () => {
      setNewType("state");
      setNewState("");
      setNewCity("");
      setNewFee("");
      setShowAddForm(false);
    };


  const handleCreate =
    async (
      event: React.FormEvent,
    ) => {
      event.preventDefault();

      resetMessages();

      const state =
        newState.trim();

      const city =
        newCity.trim();

      const fee =
        Number(newFee);

      if (!state) {
        setError(
          "Please enter a state.",
        );
        return;
      }

      if (
        newType === "city" &&
        !city
      ) {
        setError(
          "Please enter a city.",
        );
        return;
      }

      if (
        !Number.isFinite(fee) ||
        fee < 0
      ) {
        setError(
          "Please enter a valid delivery fee.",
        );
        return;
      }

      try {
        setIsSaving(true);

        const response =
          await createDeliveryZone({
            type: newType,
            state,
            ...(newType === "city"
              ? {
                  city,
                }
              : {}),
            fee,
          });

        setZones(
          (current) => [
            ...current,
            response.zone,
          ],
        );

        setSuccess(
          "Delivery price added successfully.",
        );

        resetAddForm();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to create delivery price.",
        );
      } finally {
        setIsSaving(false);
      }
    };


  const startEditing =
    (
      zone: DeliveryZone,
    ) => {
      resetMessages();

      setEditingId(
        zone._id,
      );

      setEditFee(
        String(zone.fee),
      );
    };


  const cancelEditing =
    () => {
      setEditingId(null);
      setEditFee("");
    };


  const saveEdit =
    async (
      zone: DeliveryZone,
    ) => {
      resetMessages();

      const fee =
        Number(editFee);

      if (
        !Number.isFinite(fee) ||
        fee < 0
      ) {
        setError(
          "Please enter a valid delivery fee.",
        );
        return;
      }

      try {
        setIsSaving(true);

        const response =
          await updateDeliveryZone(
            zone._id,
            {
              fee,
            },
          );

        setZones(
          (current) =>
            current.map(
              (item) =>
                item._id ===
                zone._id
                  ? response.zone
                  : item,
            ),
        );

        setSuccess(
          "Delivery price updated successfully.",
        );

        cancelEditing();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to update delivery price.",
        );
      } finally {
        setIsSaving(false);
      }
    };


  const toggleActive =
    async (
      zone: DeliveryZone,
    ) => {
      resetMessages();

      try {
        setIsSaving(true);

        const response =
          await updateDeliveryZone(
            zone._id,
            {
              isActive:
                !zone.isActive,
            },
          );

        setZones(
          (current) =>
            current.map(
              (item) =>
                item._id ===
                zone._id
                  ? response.zone
                  : item,
            ),
        );

        setSuccess(
          zone.isActive
            ? "Delivery price disabled."
            : "Delivery price enabled.",
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to update delivery price.",
        );
      } finally {
        setIsSaving(false);
      }
    };


  const handleDelete =
    async (
      zone: DeliveryZone,
    ) => {
      resetMessages();

      const confirmed =
        window.confirm(
          `Delete delivery pricing for ${
            zone.type === "city"
              ? `${zone.city}, ${zone.state}`
              : zone.state
          }?`,
        );

      if (!confirmed) {
        return;
      }

      try {
        setIsSaving(true);

        await deleteDeliveryZone(
          zone._id,
        );

        setZones(
          (current) =>
            current.filter(
              (item) =>
                item._id !==
                zone._id,
            ),
        );

        setSuccess(
          "Delivery price deleted successfully.",
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to delete delivery price.",
        );
      } finally {
        setIsSaving(false);
      }
    };


  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen flex-col lg:flex-row">

        <AdminSidebar />

        <main className="min-w-0 flex-1">

          <div className="p-5 sm:p-6 lg:p-8">

            <div className="mx-auto max-w-7xl">

              {/* HEADER */}

              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">

                <div>

                  <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
                    Admin / Delivery
                  </p>

                  <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                    Delivery Pricing
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
                    Manage interstate and location-based
                    delivery fees used by checkout.
                  </p>

                </div>


                <button
                  type="button"
                  onClick={() => {
                    resetMessages();
                    setShowAddForm(true);
                  }}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700"
                >
                  <Plus size={18} />
                  Add delivery price
                </button>

              </div>


              {/* MESSAGES */}

              {error && (
                <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                  {error}
                </div>
              )}


              {success && (
                <div className="mt-6 flex items-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                  <Check size={17} />
                  {success}
                </div>
              )}


              {/* ADD FORM */}

              {showAddForm && (
                <section className="mt-8 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <h2 className="text-lg font-black text-slate-950">
                        Add delivery price
                      </h2>

                      <p className="mt-1 text-sm text-slate-500">
                        Create a state or city-specific delivery rate.
                      </p>

                    </div>


                    <button
                      type="button"
                      onClick={resetAddForm}
                      className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50"
                    >
                      <X size={17} />
                    </button>

                  </div>


                  <form
                    onSubmit={handleCreate}
                    className="mt-6"
                  >

                    <div className="grid gap-5 md:grid-cols-2">

                      <label className="block">

                        <span className="text-sm font-bold text-slate-700">
                          Pricing level
                        </span>

                        <select
                          value={newType}
                          onChange={(event) =>
                            setNewType(
                              event.target
                                .value as DeliveryPricingType,
                            )
                          }
                          className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        >
                          <option value="state">
                            State
                          </option>

                          <option value="city">
                            City / Zone
                          </option>
                        </select>

                      </label>


                      <label className="block">

                        <span className="text-sm font-bold text-slate-700">
                          State
                        </span>

                        <input
                          value={newState}
                          onChange={(event) =>
                            setNewState(
                              event.target.value,
                            )
                          }
                          placeholder="e.g. Lagos"
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                        />

                      </label>


                      {newType === "city" && (
                        <label className="block">

                          <span className="text-sm font-bold text-slate-700">
                            City
                          </span>

                          <input
                            value={newCity}
                            onChange={(event) =>
                              setNewCity(
                                event.target.value,
                              )
                            }
                            placeholder="e.g. Ikeja"
                            className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          />

                        </label>
                      )}


                      <label className="block">

                        <span className="text-sm font-bold text-slate-700">
                          Delivery fee
                        </span>

                        <div className="relative mt-2">

                          <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm font-bold text-slate-400">
                            ₦
                          </span>

                          <input
                            type="number"
                            min="0"
                            step="100"
                            value={newFee}
                            onChange={(event) =>
                              setNewFee(
                                event.target.value,
                              )
                            }
                            placeholder="5000"
                            className="w-full rounded-xl border border-slate-200 py-3 pl-9 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                          />

                        </div>

                      </label>

                    </div>


                    <div className="mt-6 flex flex-col gap-3 sm:flex-row">

                      <button
                        type="submit"
                        disabled={isSaving}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 py-3 text-sm font-bold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Save size={16} />

                        {isSaving
                          ? "Saving..."
                          : "Save delivery price"}
                      </button>


                      <button
                        type="button"
                        onClick={resetAddForm}
                        className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                      >
                        Cancel
                      </button>

                    </div>

                  </form>

                </section>
              )}


              {/* LOADING */}

              {isLoading ? (
                <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-10 text-center">
                  <p className="text-sm font-medium text-slate-500">
                    Loading delivery pricing...
                  </p>
                </div>
              ) : (
                <>

                  {/* STATE PRICING */}

                  <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 p-5 sm:p-6">

                      <div className="flex items-start gap-3">

                        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-blue-50 text-blue-600">
                          <MapPin size={19} />
                        </div>

                        <div>

                          <h2 className="text-lg font-black text-slate-950">
                            State pricing
                          </h2>

                          <p className="mt-1 text-sm text-slate-500">
                            Default delivery fee for an entire state.
                          </p>

                        </div>

                      </div>

                    </div>


                    {stateZones.length === 0 ? (
                      <div className="p-8 text-center">

                        <p className="text-sm font-semibold text-slate-600">
                          No state pricing configured yet.
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          Add your first state delivery rate above.
                        </p>

                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">

                        {stateZones.map(
                          (zone) => (
                            <DeliveryRow
                              key={zone._id}
                              zone={zone}
                              editingId={editingId}
                              editFee={editFee}
                              isSaving={isSaving}
                              onEdit={startEditing}
                              onCancel={cancelEditing}
                              onChangeFee={setEditFee}
                              onSave={saveEdit}
                              onToggleActive={toggleActive}
                              onDelete={handleDelete}
                            />
                          ),
                        )}

                      </div>
                    )}

                  </section>


                  {/* CITY PRICING */}

                  <section className="mt-8 rounded-2xl border border-slate-200 bg-white shadow-sm">

                    <div className="border-b border-slate-100 p-5 sm:p-6">

                      <div className="flex items-start gap-3">

                        <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-violet-50 text-violet-600">
                          <Truck size={19} />
                        </div>

                        <div>

                          <h2 className="text-lg font-black text-slate-950">
                            City / zone pricing
                          </h2>

                          <p className="mt-1 text-sm text-slate-500">
                            More specific rates override state pricing.
                          </p>

                        </div>

                      </div>

                    </div>


                    {cityZones.length === 0 ? (
                      <div className="p-8 text-center">

                        <p className="text-sm font-semibold text-slate-600">
                          No city pricing configured yet.
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          State pricing will be used until a city-specific rate exists.
                        </p>

                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100">

                        {cityZones.map(
                          (zone) => (
                            <DeliveryRow
                              key={zone._id}
                              zone={zone}
                              editingId={editingId}
                              editFee={editFee}
                              isSaving={isSaving}
                              onEdit={startEditing}
                              onCancel={cancelEditing}
                              onChangeFee={setEditFee}
                              onSave={saveEdit}
                              onToggleActive={toggleActive}
                              onDelete={handleDelete}
                            />
                          ),
                        )}

                      </div>
                    )}

                  </section>

                </>
              )}

            </div>

          </div>

        </main>

      </div>
    </div>
  );
}


function DeliveryRow({
  zone,
  editingId,
  editFee,
  isSaving,
  onEdit,
  onCancel,
  onChangeFee,
  onSave,
  onToggleActive,
  onDelete,
}: {
  zone: DeliveryZone;
  editingId: string | null;
  editFee: string;
  isSaving: boolean;
  onEdit: (
    zone: DeliveryZone,
  ) => void;
  onCancel: () => void;
  onChangeFee: (
    value: string,
  ) => void;
  onSave: (
    zone: DeliveryZone,
  ) => void;
  onToggleActive: (
    zone: DeliveryZone,
  ) => void;
  onDelete: (
    zone: DeliveryZone,
  ) => void;
}) {
  const isEditing =
    editingId === zone._id;

  const location =
    zone.type === "city"
      ? `${zone.city}, ${zone.state}`
      : zone.state;

  return (
    <div className="p-5 sm:p-6">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="min-w-0">

          <div className="flex flex-wrap items-center gap-2">

            <h3 className="font-bold text-slate-950">
              {location}
            </h3>

            <span
              className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${
                zone.isActive
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {zone.isActive
                ? "Active"
                : "Inactive"}
            </span>

          </div>

          <p className="mt-1 text-xs text-slate-400">
            {zone.type === "city"
              ? "City-specific rate"
              : "State default rate"}
          </p>

        </div>


        <div className="flex flex-wrap items-center gap-3">

          {isEditing ? (
            <>

              <div className="relative">

                <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm font-bold text-slate-400">
                  ₦
                </span>

                <input
                  type="number"
                  min="0"
                  step="100"
                  value={editFee}
                  onChange={(event) =>
                    onChangeFee(
                      event.target.value,
                    )
                  }
                  className="w-36 rounded-lg border border-blue-300 py-2 pl-8 pr-3 text-sm font-bold outline-none ring-4 ring-blue-500/10"
                  autoFocus
                />

              </div>

              <button
                type="button"
                onClick={() =>
                  onSave(zone)
                }
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-950 px-3 py-2 text-xs font-bold text-white transition hover:bg-blue-600 disabled:opacity-60"
              >
                <Save size={14} />
                Save
              </button>

              <button
                type="button"
                onClick={onCancel}
                className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600"
              >
                Cancel
              </button>

            </>
          ) : (
            <>

              <span className="text-lg font-black text-slate-950">
                {formatPrice(zone.fee)}
              </span>

              <button
                type="button"
                onClick={() =>
                  onEdit(zone)
                }
                className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-600 transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600"
                title="Edit price"
              >
                <Edit3 size={16} />
              </button>

              <button
                type="button"
                onClick={() =>
                  onToggleActive(zone)
                }
                disabled={isSaving}
                className={`rounded-lg border px-3 py-2 text-xs font-bold transition ${
                  zone.isActive
                    ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                    : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                }`}
              >
                {zone.isActive
                  ? "Disable"
                  : "Enable"}
              </button>

              <button
                type="button"
                onClick={() =>
                  onDelete(zone)
                }
                disabled={isSaving}
                className="grid size-9 place-items-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                title="Delete price"
              >
                <Trash2 size={16} />
              </button>

            </>
          )}

        </div>

      </div>

    </div>
  );
}