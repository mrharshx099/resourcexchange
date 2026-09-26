/**
 * Logistics & Transportation Configuration
 * Configurable base fee and per-kilometer rates for hospitality asset delivery
 */

export const LOGISTICS_CONFIG = {
  // Base mobilization / dispatch fee ($25)
  base_fee: 25,
  
  // Standard per-kilometer rate ($2.50/km)
  per_km_rate: 2.5,
  
  // Minimum trip charge ($20)
  min_fee: 20,

  // Default speed & handling notes
  standard_eta_hours: 2,
};

/**
 * Calculates estimated logistics fee from distance and optional provider custom rate
 * @param {number} distanceKm 
 * @param {number|null} customRatePerKm 
 * @returns {object}
 */
export function calculateLogisticsFee(distanceKm, customRatePerKm = null) {
  const km = Math.max(0.5, Math.round((Number(distanceKm) || 1) * 10) / 10);
  const rate = customRatePerKm != null && Number(customRatePerKm) > 0
    ? Number(customRatePerKm)
    : LOGISTICS_CONFIG.per_km_rate;

  const rawFee = LOGISTICS_CONFIG.base_fee + (km * rate);
  const estimated_fee = Math.max(LOGISTICS_CONFIG.min_fee, Math.round(rawFee));

  return {
    distance_km: km,
    base_fee: LOGISTICS_CONFIG.base_fee,
    per_km_rate: rate,
    estimated_fee
  };
}
