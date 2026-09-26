const rawBaseUrl = import.meta.env.VITE_API_URL || '';
const API_BASE = rawBaseUrl
  ? (rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl.replace(/\/+$/, '')}/api`)
  : '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('resourcexchange_token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
}

export const api = {
  // Auth & Businesses
  async getBusinesses() {
    const res = await fetch(`${API_BASE}/auth/businesses`);
    if (!res.ok) throw new Error('Failed to fetch businesses');
    return res.json();
  },

  async login(credentials) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }
    return data;
  },

  async signup(userData) {
    const res = await fetch(`${API_BASE}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Signup failed');
    }
    return data;
  },

  async register(data) {
    return this.signup(data);
  },

  async getMe() {
    const headers = getAuthHeaders();
    if (!headers.Authorization) return null;
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers,
    });
    if (!res.ok) {
      throw new Error('Failed to rehydrate session');
    }
    return res.json();
  },

  async getProfile(id) {
    const res = await fetch(`${API_BASE}/auth/profile/${id}`);
    if (!res.ok) throw new Error('Failed to fetch profile');
    return res.json();
  },

  // Resources
  async getResources(params = {}) {
    const cleanParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        cleanParams.append(k, v);
      }
    });
    const res = await fetch(`${API_BASE}/resources?${cleanParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch resources');
    return res.json();
  },

  async getResource(id) {
    const res = await fetch(`${API_BASE}/resources/${id}`);
    if (!res.ok) throw new Error('Failed to fetch resource detail');
    return res.json();
  },

  async getProviderResources(providerId) {
    const res = await fetch(`${API_BASE}/resources/provider/${providerId}`);
    if (!res.ok) throw new Error('Failed to fetch provider listings');
    return res.json();
  },

  async createResource(data) {
    const res = await fetch(`${API_BASE}/resources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to create resource');
    }
    return res.json();
  },

  async updateResource(id, data) {
    const res = await fetch(`${API_BASE}/resources/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to update resource');
    }
    return res.json();
  },

  async deleteResource(id) {
    const res = await fetch(`${API_BASE}/resources/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete resource');
    return res.json();
  },

  async blockAvailability(resourceId, data) {
    const res = await fetch(`${API_BASE}/resources/${resourceId}/availability/block`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to block dates');
    }
    return res.json();
  },

  async unblockAvailability(resourceId, slotId) {
    const res = await fetch(`${API_BASE}/resources/${resourceId}/availability/${slotId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to unblock slot');
    return res.json();
  },

  // Requests
  async createRequest(data) {
    const res = await fetch(`${API_BASE}/requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send request');
    }
    return res.json();
  },

  async getProviderRequests(providerId) {
    const res = await fetch(`${API_BASE}/requests/provider/${providerId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch incoming requests');
    return res.json();
  },

  async getSeekerRequests(seekerId) {
    const res = await fetch(`${API_BASE}/requests/seeker/${seekerId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch outgoing requests');
    return res.json();
  },

  async getRequestDetail(id) {
    const res = await fetch(`${API_BASE}/requests/${id}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch request detail');
    return res.json();
  },

  async acceptRequest(id) {
    const res = await fetch(`${API_BASE}/requests/${id}/accept`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to accept request');
    }
    return res.json();
  },

  async counterOfferRequest(id, data) {
    const res = await fetch(`${API_BASE}/requests/${id}/counter`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to send counter offer');
    }
    return res.json();
  },

  async rejectRequest(id, reason) {
    const res = await fetch(`${API_BASE}/requests/${id}/reject`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify({ rejection_reason: reason }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to reject request');
    }
    return res.json();
  },

  async completeRequest(id) {
    const res = await fetch(`${API_BASE}/requests/${id}/complete`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to mark exchange complete');
    return res.json();
  },

  async cancelRequest(id) {
    const res = await fetch(`${API_BASE}/requests/${id}/cancel`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to cancel request');
    return res.json();
  },

  // Requirements (Wanted Board RFQ)
  async getRequirements(params = {}) {
    const cleanParams = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        cleanParams.append(k, v);
      }
    });
    const res = await fetch(`${API_BASE}/requirements?${cleanParams.toString()}`);
    if (!res.ok) throw new Error('Failed to fetch requirements');
    return res.json();
  },

  async createRequirement(data) {
    const res = await fetch(`${API_BASE}/requirements`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to post requirement');
    }
    return res.json();
  },

  async closeRequirement(id) {
    const res = await fetch(`${API_BASE}/requirements/${id}/close`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to close requirement');
    return res.json();
  },

  // Reviews
  async submitReview(data) {
    const res = await fetch(`${API_BASE}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders(),
      },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Failed to submit review');
    }
    return res.json();
  },

  async getResourceReviews(resourceId) {
    const res = await fetch(`${API_BASE}/reviews/resource/${resourceId}`);
    if (!res.ok) throw new Error('Failed to fetch resource reviews');
    return res.json();
  },

  async getBusinessReviews(businessId) {
    const res = await fetch(`${API_BASE}/reviews/business/${businessId}`);
    if (!res.ok) throw new Error('Failed to fetch business reviews');
    return res.json();
  },

  // Notifications
  async getNotifications(businessId) {
    const res = await fetch(`${API_BASE}/notifications/${businessId}`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(id) {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to mark read');
    return res.json();
  },

  async markAllNotificationsRead(businessId) {
    const res = await fetch(`${API_BASE}/notifications/read-all/${businessId}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to mark all read');
    return res.json();
  },

  // Stats & Analytics
  async getStatsSummary() {
    const res = await fetch(`${API_BASE}/stats/summary`);
    if (!res.ok) throw new Error('Failed to fetch platform stats');
    return res.json();
  },

  async getAnalytics(businessId) {
    const res = await fetch(`${API_BASE}/analytics/${businessId}`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch provider analytics');
    return res.json();
  },

  async getSuggestedPrice(requestId) {
    const res = await fetch(`${API_BASE}/requests/${requestId}/suggest-price`, {
      headers: getAuthHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch suggested fair price');
    return res.json();
  },

  // Reset Demo DB
  async resetDemoData() {
    const res = await fetch(`${API_BASE}/seed/reset`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to reset database');
    return res.json();
  },

  // In-App Chat
  async getMessages(requestId, userId = null) {
    const headers = getAuthHeaders();
    if (userId) {
      headers['x-business-id'] = userId;
    }
    const res = await fetch(`${API_BASE}/requests/${requestId}/messages${userId ? `?user_id=${userId}` : ''}`, {
      headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to fetch messages');
    }
    return res.json();
  },

  async sendMessage(requestId, content, senderId = null) {
    const headers = {
      'Content-Type': 'application/json',
      ...getAuthHeaders(),
    };
    if (senderId) {
      headers['x-business-id'] = senderId;
    }
    const res = await fetch(`${API_BASE}/requests/${requestId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ content, sender_id: senderId }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to send message');
    }
    return res.json();
  },

  // Logistics & Transportation
  async getLogisticsEstimate(distanceKm, resourceId = null) {
    const params = new URLSearchParams();
    if (distanceKm != null) params.append('distance_km', distanceKm);
    if (resourceId) params.append('resource_id', resourceId);
    const res = await fetch(`${API_BASE}/logistics/estimate?${params.toString()}`);
    if (!res.ok) throw new Error('Failed to estimate logistics fee');
    return res.json();
  },
};
