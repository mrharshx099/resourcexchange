// Rule-based matching engine for hospitality resources

// Haversine distance in kilometers
export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) return 5.0;
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Score a resource against seeker query parameters
 * Criteria & Weights:
 * - Distance fit: 30 pts
 * - Price fit vs budget: 25 pts
 * - Availability match: 20 pts
 * - Capacity fit: 15 pts
 * - Provider rating / trust: 10 pts
 */
export function scoreResource(resource, params = {}, bookedSlots = []) {
  const {
    seekerLat,
    seekerLng,
    maxDistanceKm,
    startDate,
    endDate,
    neededCapacity,
    maxBudget,
    pricingUnit = 'day'
  } = params;

  let distanceScore = 20;
  let priceScore = 20;
  let availabilityScore = 20;
  let capacityScore = 12;
  let ratingScore = 8;
  const highlights = [];

  // 1. Distance Calculation (30 pts max)
  let distanceKm = null;
  if (seekerLat && seekerLng && resource.lat && resource.lng) {
    distanceKm = calculateDistanceKm(seekerLat, seekerLng, resource.lat, resource.lng);
    if (distanceKm <= 2.5) {
      distanceScore = 30;
      highlights.push(`📍 Very close: only ${distanceKm} km away`);
    } else if (distanceKm <= 6.0) {
      distanceScore = 25;
      highlights.push(`📍 Nearby: ${distanceKm} km away`);
    } else if (distanceKm <= 12.0) {
      distanceScore = 18;
      highlights.push(`📍 ${distanceKm} km distance`);
    } else if (distanceKm <= 25.0) {
      distanceScore = 10;
    } else {
      distanceScore = 4;
    }

    if (maxDistanceKm && distanceKm > maxDistanceKm) {
      distanceScore = Math.max(0, distanceScore - 15);
    }
  } else {
    distanceKm = 4.2;
    distanceScore = 22;
  }

  // 2. Price Fit (25 pts max)
  const resourcePrice = pricingUnit === 'hour' ? (resource.price_per_hour || resource.price_per_day / 8) : (resource.price_per_day || resource.price_per_hour * 8);
  if (maxBudget && maxBudget > 0) {
    const budgetNum = Number(maxBudget);
    if (resourcePrice <= budgetNum * 0.8) {
      priceScore = 25;
      highlights.push(`💰 Great value: 20%+ below budget ($${resourcePrice}/${pricingUnit})`);
    } else if (resourcePrice <= budgetNum) {
      priceScore = 23;
      highlights.push(`💰 Within budget ($${resourcePrice}/${pricingUnit})`);
    } else if (resourcePrice <= budgetNum * 1.15) {
      priceScore = 14;
      highlights.push(`💵 Slightly above budget ($${resourcePrice}/${pricingUnit})`);
    } else if (resourcePrice <= budgetNum * 1.35) {
      priceScore = 7;
    } else {
      priceScore = 2;
    }
  } else {
    priceScore = 20;
  }

  // 3. Availability Match (20 pts max)
  let isDateConflict = false;
  if (startDate && endDate) {
    const reqStart = new Date(startDate).getTime();
    const reqEnd = new Date(endDate).getTime();

    for (const slot of bookedSlots) {
      if (slot.resource_id === resource.id) {
        const slotStart = new Date(slot.start_time).getTime();
        const slotEnd = new Date(slot.end_time).getTime();
        // Check overlap
        if (reqStart <= slotEnd && reqEnd >= slotStart) {
          isDateConflict = true;
          break;
        }
      }
    }

    if (isDateConflict) {
      availabilityScore = 0;
    } else {
      availabilityScore = 20;
      highlights.push(`📅 100% Available on selected dates`);
    }
  } else {
    availabilityScore = 18;
    highlights.push(`📅 Flexible booking available`);
  }

  // 4. Capacity Fit (15 pts max)
  if (neededCapacity && neededCapacity > 0) {
    const needed = Number(neededCapacity);
    const capacity = Number(resource.capacity || 1);
    if (capacity >= needed && capacity <= needed * 1.6) {
      capacityScore = 15;
      highlights.push(`👥 Perfect capacity fit (${capacity} ${resource.capacity_unit})`);
    } else if (capacity > needed * 1.6) {
      capacityScore = 12;
      highlights.push(`👥 Extra spacious capacity (${capacity} ${resource.capacity_unit})`);
    } else if (capacity >= needed * 0.8) {
      capacityScore = 6;
    } else {
      capacityScore = 1;
    }
  } else {
    capacityScore = 12;
  }

  // 5. Provider Rating (10 pts max)
  const rating = Number(resource.provider_rating || resource.rating || 4.5);
  ratingScore = Math.min(10, Math.round((rating / 5.0) * 10 * 10) / 10);
  if (rating >= 4.7) {
    highlights.push(`⭐ Top-rated provider (${rating} ★)`);
  }

  const totalScore = Math.min(100, Math.max(10, Math.round(distanceScore + priceScore + availabilityScore + capacityScore + ratingScore)));

  return {
    matchScore: totalScore,
    distanceKm,
    isAvailable: !isDateConflict,
    scoreBreakdown: {
      distance: { score: distanceScore, max: 30 },
      price: { score: priceScore, max: 25 },
      availability: { score: availabilityScore, max: 20 },
      capacity: { score: capacityScore, max: 15 },
      rating: { score: ratingScore, max: 10 }
    },
    highlights
  };
}
