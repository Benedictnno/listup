import { getFirebaseAnalytics } from './firebase';
import { logEvent } from 'firebase/analytics';

// ── Firebase Analytics ──────────────────────────────────────────────────────

async function firebaseEvent(name: string, params: Record<string, unknown> = {}) {
  try {
    const analytics = await getFirebaseAnalytics();
    if (analytics) logEvent(analytics, name, params);
  } catch (_) {
    // Analytics is non-critical — silently swallow
  }
}

export const FirebaseAnalytics = {
  signUp:            (method = 'email')            => firebaseEvent('sign_up', { method }),
  login:             (method = 'email')            => firebaseEvent('login', { method }),
  googleLogin:       ()                            => firebaseEvent('login', { method: 'google' }),
  upgradeToVendor:   ()                            => firebaseEvent('upgrade_to_vendor'),
  viewListing:       (id: string, title: string, price: number) =>
                       firebaseEvent('view_item', { item_id: id, item_name: title, value: price }),
  saveListing:       (id: string)                  => firebaseEvent('save_listing', { item_id: id }),
  messageSeller:     (id: string)                  => firebaseEvent('message_seller', { item_id: id }),
  createListing:     (categoryId: string)          => firebaseEvent('create_listing', { category_id: categoryId }),
  search:            (query: string)               => firebaseEvent('search', { search_term: query }),
  beginCheckout:     (amount: number, type: string) =>
                       firebaseEvent('begin_checkout', { value: amount, currency: 'NGN', payment_type: type }),
  purchase:          (txId: string, amount: number, type: string) =>
                       firebaseEvent('purchase', { transaction_id: txId, value: amount, currency: 'NGN', payment_type: type }),
  kycStart:          ()                            => firebaseEvent('kyc_start'),
  kycComplete:       ()                            => firebaseEvent('kyc_complete'),
  startConversation: (sellerId: string)            => firebaseEvent('start_conversation', { seller_id: sellerId }),
};

export default FirebaseAnalytics;
