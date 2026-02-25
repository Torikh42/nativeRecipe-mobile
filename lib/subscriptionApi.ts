import { Platform } from 'react-native';

const API_URL = process.env.EXPO_PUBLIC_API_URL;
const MIDTRANS_CLIENT_KEY = process.env.MIDTRANS_CLIENT_KEY;
const IS_PRODUCTION = process.env.MIDTRANS_IS_PRODUCTION === 'true';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: number;
  durationUnit: string;
  features: string[];
  savings?: number;
  popular?: boolean;
}

export interface SubscriptionStatus {
  isPro: boolean;
  planType: string | null;
  status: string | null;
  endDate: string | null;
  daysRemaining: number;
}

export interface CreateSubscriptionResponse {
  success: boolean;
  message: string;
  data: {
    orderId: string;
    snapToken: string;
    redirectUrl: string;
    price: number;
    planType: string;
  };
}

class SubscriptionAPI {
  private async fetchWithAuth(endpoint: string, token: string | null, options: RequestInit = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || data.error || 'Request failed');
    }

    return data;
  }

  /**
   * Get available subscription plans
   */
  async getPlans(token: string | null): Promise<SubscriptionPlan[]> {
    const data = await this.fetchWithAuth('/api/subscription/plans', token);
    return data.data?.plans || [];
  }

  /**
   * Get current user's subscription status
   */
  async getStatus(token: string | null): Promise<SubscriptionStatus | null> {
    try {
      const data = await this.fetchWithAuth('/api/subscription/status', token);
      return data.data;
    } catch (error) {
      return null;
    }
  }

  /**
   * Create a new subscription
   */
  async createSubscription(
    token: string,
    planType: 'monthly' | 'yearly',
    userDetails?: {
      email?: string;
      phone?: string;
      name?: string;
    }
  ): Promise<CreateSubscriptionResponse> {
    const data = await this.fetchWithAuth('/api/subscription/create', token, {
      method: 'POST',
      body: JSON.stringify({
        planType,
        ...userDetails,
      }),
    });
    return data;
  }

  /**
   * Check transaction status
   */
  async checkTransaction(token: string, orderId: string): Promise<any> {
    const data = await this.fetchWithAuth(`/api/subscription/check/${orderId}`, token);
    return data.data;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(token: string, orderId: string): Promise<void> {
    await this.fetchWithAuth('/api/subscription/cancel', token, {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  }

  /**
   * Open Midtrans payment popup (React Native)
   * For mobile, we'll use WebView or deep link to Midtrans
   */
  async openPayment(redirectUrl: string): Promise<void> {
    // For React Native, we'll use Linking to open the payment URL
    const { Linking } = await import('react-native');
    const supported = await Linking.canOpenURL(redirectUrl);
    
    if (supported) {
      await Linking.openURL(redirectUrl);
    } else {
      throw new Error('Cannot open payment URL');
    }
  }
}

export const subscriptionAPI = new SubscriptionAPI();
