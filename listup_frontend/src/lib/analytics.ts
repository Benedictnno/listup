import FirebaseAnalytics from './firebaseAnalytics';

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || process.env.VITE_GA_MEASUREMENT_ID;

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

export function initGA() {
  if (typeof window === 'undefined' || !GA_ID) return;
  if (document.querySelector(`script[src*="googletagmanager"]`)) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  window.gtag('js', new Date());
  window.gtag('config', GA_ID, { send_page_view: false });
}

export function trackPageView(url: string, title: string) {
  if (typeof window === 'undefined' || !window.gtag || !GA_ID) return;
  window.gtag('event', 'page_view', { page_location: url, page_title: title });
}

export function trackEvent(eventName: string, params: Record<string, any> = {}) {
  // 1. Track in GA4
  if (typeof window !== 'undefined' && window.gtag && GA_ID) {
    window.gtag('event', eventName, params);
  }

  // Note: Firebase tracking is handled by the methods in the Analytics object below
  // to ensure they use the correct Firebase Analytics parameters.
}

export const Analytics = {
  signUp: (method = 'email') => {
    trackEvent('sign_up', { method });
    FirebaseAnalytics.signUp(method);
  },
  login: (method = 'email') => {
    trackEvent('login', { method });
    FirebaseAnalytics.login(method);
  },
  googleLogin: () => {
    trackEvent('login', { method: 'google' });
    FirebaseAnalytics.googleLogin();
  },
  upgradeToVendor: () => {
    trackEvent('upgrade_to_vendor');
    FirebaseAnalytics.upgradeToVendor();
  },
  viewListing: (id: string, title: string, price: number) => {
    trackEvent('view_item', { item_id: id, item_name: title, value: price });
    FirebaseAnalytics.viewListing(id, title, price);
  },
  saveListing: (id: string) => {
    trackEvent('save_listing', { item_id: id });
    FirebaseAnalytics.saveListing(id);
  },
  messageSeller: (id: string) => {
    trackEvent('message_seller', { item_id: id });
    FirebaseAnalytics.messageSeller(id);
  },
  createListing: (categoryId: string) => {
    trackEvent('create_listing', { category_id: categoryId });
    FirebaseAnalytics.createListing(categoryId);
  },
  search: (query: string) => {
    trackEvent('search', { search_term: query });
    FirebaseAnalytics.search(query);
  },
  beginCheckout: (amount: number, type: string) => {
    trackEvent('begin_checkout', { value: amount, currency: 'NGN', payment_type: type });
    FirebaseAnalytics.beginCheckout(amount, type);
  },
  purchase: (txId: string, amount: number, type: string) => {
    trackEvent('purchase', { transaction_id: txId, value: amount, currency: 'NGN', payment_type: type });
    FirebaseAnalytics.purchase(txId, amount, type);
  },
  kycStart: () => {
    trackEvent('kyc_start');
    FirebaseAnalytics.kycStart();
  },
  kycComplete: () => {
    trackEvent('kyc_complete');
    FirebaseAnalytics.kycComplete();
  },
  startConversation: (sellerId: string) => {
    trackEvent('start_conversation', { seller_id: sellerId });
    FirebaseAnalytics.startConversation(sellerId);
  },
};

export default Analytics;
