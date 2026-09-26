import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { 
  X, 
  Building2, 
  DollarSign, 
  Users, 
  MapPin, 
  Clock, 
  FileText, 
  Image as ImageIcon, 
  Check, 
  Plus, 
  AlertCircle,
  Truck
} from 'lucide-react';

const CATEGORY_CONFIG = {
  'Banquet & Event Space': {
    type: 'Space',
    unit: 'guests',
    defaultImg: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80',
    amenitySuggestions: ['High-Speed Wi-Fi', 'Integrated Audio System', 'Bridal Suite', 'Loading Dock Access', 'Dimmable Chandeliers', 'Climate Control']
  },
  'Commercial Kitchen & Cold Storage': {
    type: 'Kitchen',
    unit: 'meals/hr',
    defaultImg: 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=1200&q=80',
    amenitySuggestions: ['Combi Ovens', 'Walk-in Refrigerator', 'Commercial Dishwasher', 'Blast Chiller', 'Grease Interceptor']
  },
  'Guest Parking & Valet Lots': {
    type: 'Parking',
    unit: 'vehicles',
    defaultImg: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=1200&q=80',
    amenitySuggestions: ['24/7 CCTV', 'EV Chargers', 'Direct Hotel Elevator', 'Valet Attendant Option', 'Covered & Heated']
  },
  'Refrigerated Fleet & Transport': {
    type: 'Fleet',
    unit: 'pallets',
    defaultImg: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?auto=format&fit=crop&w=1200&q=80',
    amenitySuggestions: ['Dual-Temp Cooling', 'Hydraulic Liftgate', 'E-Track Straps', 'Electric Standby', 'Pallet Jack Included']
  },
  'Audio, Lighting & Stage AV': {
    type: 'AV',
    unit: 'audience',
    defaultImg: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    amenitySuggestions: ['Digital Audio Console', 'Wireless Mics', 'Line Array Speakers', 'LED Par Cans', 'Heavy Duty Cases']
  },
  'Banquet Furniture & Decor': {
    type: 'Furniture',
    unit: 'sets',
    defaultImg: 'https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=80',
    amenitySuggestions: ['Foam Cushions', 'Round Folding Tables', 'Champagne Linens', 'Transport Dollies']
  }
};

export default function ListingFormModal({ resource, isOpen, onClose, onSuccess }) {
  const { currentUser, addToast } = useAuth();

  const isEditing = !!resource;

  const [category, setCategory] = useState(resource?.category || 'Banquet & Event Space');
  const [title, setTitle] = useState(resource?.title || '');
  const [description, setDescription] = useState(resource?.description || '');
  const [capacity, setCapacity] = useState(resource?.capacity || 200);
  const [capacityUnit, setCapacityUnit] = useState(resource?.capacity_unit || CATEGORY_CONFIG['Banquet & Event Space'].unit);
  const [quantity, setQuantity] = useState(resource?.quantity || 1);
  const [location, setLocation] = useState(resource?.location || currentUser?.location || 'New York, NY');
  const [pricePerDay, setPricePerDay] = useState(resource?.price_per_day || 1200);
  const [pricePerHour, setPricePerHour] = useState(resource?.price_per_hour || 150);
  const [pricingUnit, setPricingUnit] = useState(resource?.pricing_unit || 'day');
  const [minDurationHours, setMinDurationHours] = useState(resource?.min_duration_hours || 4);
  const [conditions, setConditions] = useState(resource?.conditions || 'Certificate of insurance required ($2M liability). Clean-as-you-go policy.');
  const [imageUrl, setImageUrl] = useState(resource?.image_url || CATEGORY_CONFIG['Banquet & Event Space'].defaultImg);
  const [amenities, setAmenities] = useState(resource?.amenities || CATEGORY_CONFIG['Banquet & Event Space'].amenitySuggestions.slice(0, 4));
  const [newAmenity, setNewAmenity] = useState('');
  const [supportsTransport, setSupportsTransport] = useState(
    resource?.supports_transport != null ? Boolean(resource.supports_transport) : true
  );
  const [transportRatePerKm, setTransportRatePerKm] = useState(
    resource?.transport_rate_per_km != null ? resource.transport_rate_per_km : 2.5
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleCategoryChange = (newCat) => {
    setCategory(newCat);
    const config = CATEGORY_CONFIG[newCat];
    if (config) {
      setCapacityUnit(config.unit);
      if (!isEditing) {
        setImageUrl(config.defaultImg);
        setAmenities(config.amenitySuggestions.slice(0, 4));
      }
    }
  };

  const handleAddAmenity = (e) => {
    e.preventDefault();
    if (newAmenity.trim() && !amenities.includes(newAmenity.trim())) {
      setAmenities([...amenities, newAmenity.trim()]);
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (item) => {
    setAmenities(amenities.filter(a => a !== item));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentUser) {
      addToast('Please login or select a provider account', 'error');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const type = CATEGORY_CONFIG[category]?.type || 'Space';
      const payload = {
        provider_id: currentUser.id,
        title,
        description,
        type,
        category,
        capacity: Number(capacity),
        capacity_unit: capacityUnit,
        quantity: Number(quantity),
        location,
        lat: currentUser.lat,
        lng: currentUser.lng,
        price_per_day: Number(pricePerDay),
        price_per_hour: Number(pricePerHour),
        pricing_unit: pricingUnit,
        min_duration_hours: Number(minDurationHours),
        conditions,
        amenities,
        supports_transport: supportsTransport ? 1 : 0,
        transport_rate_per_km: supportsTransport ? Number(transportRatePerKm) || 2.5 : null,
        image_url: imageUrl,
        images: [imageUrl]
      };

      if (isEditing) {
        await api.updateResource(resource.id, payload);
        addToast('Listing updated successfully!', 'success');
      } else {
        await api.createResource(payload);
        confetti({
          particleCount: 75,
          spread: 65,
          origin: { y: 0.6 }
        });
        addToast('Resource listed successfully! It is now live in the marketplace.', 'success');
      }

      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to save listing');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                {isEditing ? 'Edit Resource Listing' : 'List Shared Hospitality Resource'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Monetize idle banquet space, kitchens, fleet, or equipment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {errorMsg && (
            <div className="p-2.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/40 rounded-xl text-xs text-rose-700 dark:text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-500 dark:text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Category Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Resource Category
            </label>
            <select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
            >
              {Object.keys(CATEGORY_CONFIG).map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Listing Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Grand Crystal Ballroom with Integrated Lighting"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Description & Highlights
            </label>
            <textarea
              rows="2"
              required
              placeholder="Describe capacity, technical specs, loading docks, equipment models, and ideal event types..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Capacity, Unit & Quantity */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Max Capacity
              </label>
              <input
                type="number"
                required
                min="1"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Capacity Unit
              </label>
              <input
                type="text"
                required
                value={capacityUnit}
                onChange={(e) => setCapacityUnit(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Quantity Available
              </label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Pricing & Min Duration */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Daily Rate ($)
              </label>
              <input
                type="number"
                required
                min="0"
                value={pricePerDay}
                onChange={(e) => setPricePerDay(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" /> Hourly Rate ($)
              </label>
              <input
                type="number"
                min="0"
                value={pricePerHour}
                onChange={(e) => setPricePerHour(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-teal-500 dark:text-teal-400" /> Min Rental
              </label>
              <input
                type="number"
                min="1"
                placeholder="Hours"
                value={minDurationHours}
                onChange={(e) => setMinDurationHours(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Location / Address
            </label>
            <input
              type="text"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Image URL & Thumbnail Preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" /> Photo URL
            </label>
            <div className="flex gap-2">
              <input
                type="url"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500 truncate"
              />
              <img
                src={imageUrl}
                alt="Preview"
                className="w-10 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shrink-0"
              />
            </div>
          </div>

          {/* Amenities Tag Chips */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
              Included Amenities & Equipment Features
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {amenities.map((item) => (
                <span
                  key={item}
                  className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg text-xs"
                >
                  <Check className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                  {item}
                  <button
                    type="button"
                    onClick={() => handleRemoveAmenity(item)}
                    className="text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 ml-1"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add custom feature (e.g. Loading dock, 24/7 Security)..."
                value={newAmenity}
                onChange={(e) => setNewAmenity(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddAmenity}
                className="px-3 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-xs font-semibold text-slate-800 dark:text-white transition-colors"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Transportation / Logistics Offering Section */}
          <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/80 dark:border-indigo-800/50 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600/15 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    Offer Delivery / Logistics Support
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Allow seekers to book drop-off and pickup logistics for this item
                  </p>
                </div>
              </div>

              {/* Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={supportsTransport}
                  onChange={(e) => setSupportsTransport(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {supportsTransport && (
              <div className="pt-3 border-t border-indigo-200/60 dark:border-indigo-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
                <div className="text-[11px] text-slate-600 dark:text-slate-400">
                  <p className="font-semibold text-slate-800 dark:text-slate-200">Custom Delivery Surcharge Rate</p>
                  <p className="text-[10px] text-slate-500">Base platform fee ($25) applies automatically.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      value={transportRatePerKm}
                      onChange={(e) => setTransportRatePerKm(e.target.value)}
                      className="w-24 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-7 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-100 font-bold focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <span className="text-xs text-slate-500 font-semibold">/ km</span>
                </div>
              </div>
            )}
          </div>

          {/* Conditions */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5 text-slate-400" /> Rules & Rental Conditions
            </label>
            <textarea
              rows="2"
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 resize-none"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-950/20 dark:shadow-emerald-950/50 flex items-center gap-2 transition-all active:scale-95"
            >
              <Check className="w-3.5 h-3.5" />
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Listing' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
