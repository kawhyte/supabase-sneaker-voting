// Notification Service for SoleTracker
export class NotificationService {
  private static instance: NotificationService;
  private registration: ServiceWorkerRegistration | null = null;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize service worker and notification permissions
  async initialize(): Promise<boolean> {
    if (typeof window === 'undefined') {
      console.log('NotificationService: Window not available (SSR)');
      return false;
    }

    if (!('serviceWorker' in navigator)) {
      console.log('NotificationService: Service Worker not supported');
      return false;
    }

    if (!('Notification' in window)) {
      console.log('NotificationService: Notifications not supported');
      return false;
    }

    try {
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('NotificationService: Service Worker registered successfully');

      // Handle service worker updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content available, refresh recommended
              console.log('NotificationService: New content available');
            }
          });
        }
      });

      return true;
    } catch (error) {
      console.error('NotificationService: Service Worker registration failed:', error);
      return false;
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    console.log('NotificationService: Permission status:', permission);
    return permission;
  }

  // Check if notifications are supported and permitted
  isNotificationSupported(): boolean {
    return (
      typeof window !== 'undefined' &&
      'Notification' in window &&
      'serviceWorker' in navigator
    );
  }

  // Get current notification permission status
  getPermissionStatus(): NotificationPermission {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }
    return Notification.permission;
  }

  // Subscribe to push notifications
  async subscribeToPush(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('NotificationService: Service Worker not registered');
      return null;
    }

    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      console.log('NotificationService: Permission not granted');
      return null;
    }

    try {
      // Generate VAPID key pair for production (this is a placeholder)
      const applicationServerKey = this.urlBase64ToUint8Array(
        'BEl62iUYgUivxIkv69yViEuiBIa40HI80NM9YFiNXlnJFGP1-JM8vRyGgbMQwqQ6L1-8KK4VvwWKKhH8R_a7j9k'
      );

      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey,
      });

      console.log('NotificationService: Push subscription successful');
      return subscription;
    } catch (error) {
      console.error('NotificationService: Push subscription failed:', error);
      return null;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribeFromPush(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const subscription = await this.registration.pushManager.getSubscription();
      if (subscription) {
        await subscription.unsubscribe();
        console.log('NotificationService: Unsubscribed from push notifications');
        return true;
      }
      return false;
    } catch (error) {
      console.error('NotificationService: Unsubscribe failed:', error);
      return false;
    }
  }

  // Get current push subscription
  async getPushSubscription(): Promise<PushSubscription | null> {
    if (!this.registration) {
      return null;
    }

    try {
      return await this.registration.pushManager.getSubscription();
    } catch (error) {
      console.error('NotificationService: Failed to get subscription:', error);
      return null;
    }
  }

  // Send local notification (for testing)
  showLocalNotification(title: string, options: NotificationOptions = {}): void {
    if (this.getPermissionStatus() !== 'granted') {
      console.log('NotificationService: Permission not granted for local notification');
      return;
    }

    const notification = new Notification(title, {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      ...options,
    });

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);
  }

  // Helper function to convert VAPID key
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Store subscription in database
  async storeSubscription(subscription: PushSubscription, userName: string = 'test_user'): Promise<boolean> {
    try {
      const response = await fetch('/api/manage-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          user_name: userName,
          action: 'subscribe'
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log('NotificationService: Subscription stored in database');
        return true;
      } else {
        console.error('NotificationService: Failed to store subscription:', result.error);
        return false;
      }
    } catch (error) {
      console.error('NotificationService: Error storing subscription:', error);
      return false;
    }
  }

  // Remove subscription from database
  async removeSubscription(subscription: PushSubscription, userName: string = 'test_user'): Promise<boolean> {
    try {
      const response = await fetch('/api/manage-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription,
          user_name: userName,
          action: 'unsubscribe'
        }),
      });

      const result = await response.json();
      if (result.success) {
        console.log('NotificationService: Subscription removed from database');
        return true;
      } else {
        console.error('NotificationService: Failed to remove subscription:', result.error);
        return false;
      }
    } catch (error) {
      console.error('NotificationService: Error removing subscription:', error);
      return false;
    }
  }

  // Test notification functionality
  async testNotification(): Promise<boolean> {
    const permission = await this.requestPermission();
    if (permission !== 'granted') {
      return false;
    }

    this.showLocalNotification('SoleTracker Test', {
      body: 'Notifications are working! You\'ll receive alerts when your monitored items hit target prices.',
      tag: 'test-notification',
    });

    return true;
  }
}