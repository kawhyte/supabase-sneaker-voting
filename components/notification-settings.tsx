'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, BellOff, TestTube, Check, X, AlertCircle } from 'lucide-react';
import { NotificationService } from '@/lib/notification-service';
import { toast } from 'sonner';

export function NotificationSettings() {
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [notificationService] = useState(() => NotificationService.getInstance());

  useEffect(() => {
    const initializeNotifications = async () => {
      const supported = notificationService.isNotificationSupported();
      setIsSupported(supported);

      if (supported) {
        const currentPermission = notificationService.getPermissionStatus();
        setPermission(currentPermission);

        // Initialize service worker
        await notificationService.initialize();

        // Check subscription status
        const subscription = await notificationService.getPushSubscription();
        setIsSubscribed(!!subscription);
      }
    };

    initializeNotifications();
  }, [notificationService]);

  const handleEnableNotifications = async () => {
    setIsLoading(true);
    try {
      const permission = await notificationService.requestPermission();
      setPermission(permission);

      if (permission === 'granted') {
        const subscription = await notificationService.subscribeToPush();
        setIsSubscribed(!!subscription);

        if (subscription) {
          // Store subscription in database
          const stored = await notificationService.storeSubscription(subscription, 'test_user');
          if (stored) {
            toast.success('Notifications enabled successfully!');
          } else {
            toast.error('Notifications enabled but failed to save settings');
          }
        } else {
          toast.error('Failed to subscribe to push notifications');
        }
      } else {
        toast.error('Notification permission denied');
      }
    } catch (error) {
      console.error('Failed to enable notifications:', error);
      toast.error('Failed to enable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisableNotifications = async () => {
    setIsLoading(true);
    try {
      const subscription = await notificationService.getPushSubscription();
      const unsubscribed = await notificationService.unsubscribeFromPush();

      if (unsubscribed && subscription) {
        // Remove subscription from database
        await notificationService.removeSubscription(subscription, 'test_user');
        setIsSubscribed(false);
        toast.success('Notifications disabled');
      } else {
        toast.error('Failed to disable notifications');
      }
    } catch (error) {
      console.error('Failed to disable notifications:', error);
      toast.error('Failed to disable notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setIsLoading(true);
    try {
      const success = await notificationService.testNotification();
      if (success) {
        toast.success('Test notification sent!');
      } else {
        toast.error('Failed to send test notification');
      }
    } catch (error) {
      console.error('Test notification failed:', error);
      toast.error('Test notification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const getPermissionBadge = () => {
    switch (permission) {
      case 'granted':
        return <Badge className="bg-green-100 text-green-700 border-green-200"><Check className="w-3 h-3 mr-1" />Granted</Badge>;
      case 'denied':
        return <Badge className="bg-red-100 text-red-700 border-red-200"><X className="w-3 h-3 mr-1" />Denied</Badge>;
      case 'default':
        return <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200"><AlertCircle className="w-3 h-3 mr-1" />Not Set</Badge>;
      default:
        return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="w-5 h-5" />
            Browser Notifications
          </CardTitle>
          <CardDescription>
            Your browser doesn't support push notifications or you're viewing this page in an unsupported environment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            To receive price alerts, please use a modern browser that supports Service Workers and Push API.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Browser Notifications
        </CardTitle>
        <CardDescription>
          Get notified when your monitored items hit target prices or go on sale
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="font-medium">Permission Status</div>
            <div className="text-sm text-muted-foreground">Current browser notification permission</div>
          </div>
          {getPermissionBadge()}
        </div>

        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="font-medium">Push Notifications</div>
            <div className="text-sm text-muted-foreground">
              {isSubscribed ? 'Active - you will receive price alerts' : 'Inactive - no alerts will be sent'}
            </div>
          </div>
          <Badge variant={isSubscribed ? 'default' : 'secondary'}>
            {isSubscribed ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        <div className="flex gap-3 pt-4">
          {permission !== 'granted' || !isSubscribed ? (
            <Button
              onClick={handleEnableNotifications}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <Bell className="w-4 h-4" />
              {isLoading ? 'Enabling...' : 'Enable Notifications'}
            </Button>
          ) : (
            <Button
              onClick={handleDisableNotifications}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <BellOff className="w-4 h-4" />
              {isLoading ? 'Disabling...' : 'Disable Notifications'}
            </Button>
          )}

          {permission === 'granted' && (
            <Button
              onClick={handleTestNotification}
              disabled={isLoading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <TestTube className="w-4 h-4" />
              Test
            </Button>
          )}
        </div>

        {permission === 'denied' && (
          <div className="rounded-md bg-yellow-50 border border-yellow-200 p-4">
            <div className="text-sm">
              <strong className="text-yellow-800">Permission Denied</strong>
              <p className="text-yellow-700 mt-1">
                Notifications are blocked. To enable them, click the lock or notification icon in your browser's address bar and allow notifications for this site.
              </p>
            </div>
          </div>
        )}

        <div className="text-xs text-muted-foreground">
          <p>• Notifications will only be sent for items you're actively monitoring</p>
          <p>• You can disable notifications at any time</p>
          <p>• Your browser may show additional permission prompts</p>
        </div>
      </CardContent>
    </Card>
  );
}