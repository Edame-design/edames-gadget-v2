const DeliveryZone =
  require("../models/deliveryZone");

function normalizeLocation(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

function normalizeForMatch(value) {
  return normalizeLocation(
    value,
  ).toLowerCase();
}

async function calculateDeliveryFee({
  state,
  city,
}) {
  const normalizedState =
    normalizeLocation(state);

  const normalizedCity =
    normalizeLocation(city);

  if (!normalizedState) {
    throw new Error(
      "Delivery state is required",
    );
  }

  if (!normalizedCity) {
    throw new Error(
      "Delivery city is required",
    );
  }

  /*
   * ---------------------------------------------------------
   * CITY / ZONE PRICE
   * ---------------------------------------------------------
   *
   * City-specific pricing has priority over
   * the general state price.
   */

  const cityZones =
    await DeliveryZone.find({
      type: "city",
      isActive: true,
    }).lean();

  const cityZone =
    cityZones.find(
      (zone) =>
        normalizeForMatch(
          zone.state,
        ) ===
          normalizeForMatch(
            normalizedState,
          ) &&
        normalizeForMatch(
          zone.city,
        ) ===
          normalizeForMatch(
            normalizedCity,
          ),
    );

  if (cityZone) {
    return {
      status: "estimated",
      source: "city",
      fee: cityZone.fee,
      state: normalizedState,
      city: normalizedCity,
      zoneId: cityZone._id,
    };
  }

  /*
   * ---------------------------------------------------------
   * STATE PRICE
   * ---------------------------------------------------------
   */

  const stateZones =
    await DeliveryZone.find({
      type: "state",
      isActive: true,
    }).lean();

  const stateZone =
    stateZones.find(
      (zone) =>
        normalizeForMatch(
          zone.state,
        ) ===
        normalizeForMatch(
          normalizedState,
        ),
    );

  if (stateZone) {
    return {
      status: "estimated",
      source: "state",
      fee: stateZone.fee,
      state: normalizedState,
      city: normalizedCity,
      zoneId: stateZone._id,
    };
  }

  /*
   * ---------------------------------------------------------
   * NO AUTOMATIC PRICE
   * ---------------------------------------------------------
   */

  return {
    status: "quote_required",
    source: "manual",
    fee: 0,
    state: normalizedState,
    city: normalizedCity,
    zoneId: null,
  };
}

module.exports = {
  calculateDeliveryFee,
};