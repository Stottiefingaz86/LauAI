// Payment API Service
// This service handles payment processing using the provided JWT token

const PAYMENT_API_TOKEN = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiI5NGQ1OWNlZi1kYmI4LTRlYTUtYjE3OC1kMjU0MGZjZDY5MTkiLCJqdGkiOiJmODU1NWRmODQzYjBlM2MxYjBiN2RiNTIzYjU2MGU5OTFkZWU0NjVmMzZhZmYyOTUxNmM1NTZjZTQ5NDZmYjc5YTA5MzAzYzViZDg5ZGIxYyIsImlhdCI6MTc1MzM1NDczMy41OTM1NzgsIm5iZiI6MTc1MzM1NDczMy41OTM1ODEsImV4cCI6MjA2ODg4NzUzMy41NTM5MTQsInN1YiI6IjUyNjI5NDgiLCJzY29wZXMiOltdfQ.awbuL9UwPyLozK3xNYu1XxVpWWZ1R0xRYjc_D6Xna3T4oxmvgj6J0IDZKMHoOT0PkUeZbUFGTZfeniF8AvjAPKoF-_G1FjV-26nX_yhEYdz1wjX9OUIsAygEJ0zdYADrQxlgRq3cGTSh60ya26Qkl_aV_vz-KaqD5wOXCJOZD9-YLbP_jjwAxFrR23en6slFqzo1oMVgFeJ_IVlmQC7bCdeHT4fMxeXXDNQTfaSvMr_Wtl17OeYbI5A6zhMNVNTXgciVhOkJ6S8C6FJAI1Fu6ZCtIO6wzdoYIXDoJgsQNLqubA7FbDzhmoCY7Zpb3YzpQCzSNqX75oxbhMCFaAsSQ0GdmFLYCl4UlDvE0UegETKmHkOmFGcWE1qlIsw68fPS_lNT32zgEMf544sqjg5ZNXabnME9kq7xMe20yspBo4NLtYzrGrXJf1iupidfcQRtqgyfRTuoFcQOYM-nh4vGGftNhcMtKsYNwDdzstvn3SLOy8R0zSTubaihCd1Uh1Ly';

// Base API configuration
const API_BASE_URL = 'https://api.payment.com'; // Replace with actual API base URL

// Production URL configuration
const PRODUCTION_URL = 'https://lau-r6el3zy53-chris-projects-e99bc8f6.vercel.app';

export const paymentService = {
  // Initialize payment session
  async createPaymentSession(planData) {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYMENT_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan: planData.plan,
          seats: planData.seats,
          amount: planData.amount,
          currency: 'EUR',
          customer_email: planData.customerEmail,
          return_url: `${PRODUCTION_URL}/app/billing?success=true`,
          cancel_url: `${PRODUCTION_URL}/app/billing?canceled=true`,
        }),
      });

      if (!response.ok) {
        throw new Error(`Payment API error: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating payment session:', error);
      return { data: null, error };
    }
  },

  // Get payment session status
  async getPaymentSession(sessionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/sessions/${sessionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYMENT_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Payment API error: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Error getting payment session:', error);
      return { data: null, error };
    }
  },

  // Create subscription
  async createSubscription(subscriptionData) {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYMENT_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer_id: subscriptionData.customerId,
          plan_id: subscriptionData.planId,
          seats: subscriptionData.seats,
          start_date: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Payment API error: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating subscription:', error);
      return { data: null, error };
    }
  },

  // Update subscription
  async updateSubscription(subscriptionId, updates) {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${PAYMENT_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error(`Payment API error: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Error updating subscription:', error);
      return { data: null, error };
    }
  },

  // Cancel subscription
  async cancelSubscription(subscriptionId) {
    try {
      const response = await fetch(`${API_BASE_URL}/subscriptions/${subscriptionId}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYMENT_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Payment API error: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Error canceling subscription:', error);
      return { data: null, error };
    }
  },

  // Get customer billing info
  async getCustomerBilling(customerId) {
    try {
      const response = await fetch(`${API_BASE_URL}/customers/${customerId}/billing`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYMENT_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Payment API error: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Error getting customer billing:', error);
      return { data: null, error };
    }
  },

  // Create customer
  async createCustomer(customerData) {
    try {
      const response = await fetch(`${API_BASE_URL}/customers`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYMENT_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: customerData.email,
          name: customerData.name,
          metadata: {
            user_id: customerData.userId,
            company: customerData.company,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Payment API error: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Error creating customer:', error);
      return { data: null, error };
    }
  },

  // Get available plans
  async getPlans() {
    try {
      const response = await fetch(`${API_BASE_URL}/plans`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PAYMENT_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Payment API error: ${response.status}`);
      }

      const data = await response.json();
      return { data, error: null };
    } catch (error) {
      console.error('Error getting plans:', error);
      return { data: null, error };
    }
  },

  // Process webhook events
  async processWebhook(eventData) {
    try {
      // Handle different webhook events
      switch (eventData.type) {
        case 'subscription.created':
          return await this.handleSubscriptionCreated(eventData);
        case 'subscription.updated':
          return await this.handleSubscriptionUpdated(eventData);
        case 'subscription.canceled':
          return await this.handleSubscriptionCanceled(eventData);
        case 'payment.succeeded':
          return await this.handlePaymentSucceeded(eventData);
        case 'payment.failed':
          return await this.handlePaymentFailed(eventData);
        default:
          console.log('Unhandled webhook event:', eventData.type);
          return { success: true };
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
      return { success: false, error };
    }
  },

  // Webhook handlers
  async handleSubscriptionCreated(eventData) {
    // Update user's billing info in your database
    console.log('Subscription created:', eventData);
    return { success: true };
  },

  async handleSubscriptionUpdated(eventData) {
    // Update user's billing info in your database
    console.log('Subscription updated:', eventData);
    return { success: true };
  },

  async handleSubscriptionCanceled(eventData) {
    // Update user's billing info in your database
    console.log('Subscription canceled:', eventData);
    return { success: true };
  },

  async handlePaymentSucceeded(eventData) {
    // Update payment status in your database
    console.log('Payment succeeded:', eventData);
    return { success: true };
  },

  async handlePaymentFailed(eventData) {
    // Handle failed payment
    console.log('Payment failed:', eventData);
    return { success: true };
  },
};

// Plan configurations
export const plans = {
  basic: {
    id: 'basic',
    name: 'Basic',
    price: 20,
    seats: 5,
    features: ['Team Management', 'Basic Analytics', 'Survey System'],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    price: 50,
    seats: 20,
    features: ['Advanced Analytics', 'Custom Surveys', 'Priority Support'],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 100,
    seats: 100,
    features: ['Unlimited Seats', 'Custom Integrations', 'Dedicated Support'],
  },
}; 