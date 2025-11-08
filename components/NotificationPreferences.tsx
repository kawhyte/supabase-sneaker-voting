/**
 * NOTIFICATION PREFERENCES - FULL SETTINGS PANEL
 *
 * Features:
 * - Channel toggles (In-App, Push, Email)
 * - Per-notification-type toggles
 * - Quiet hours with timezone awareness
 * - Bundling preferences
 * - Max daily notifications slider
 * - Test notification button
 * - IMPORTANT: Use .dense class where appropriate
 */

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	Bell,
	Clock,
	Package,
	Tag,
	Sparkles,
	Trophy,
	AlertCircle,
	ShoppingBag,
	Unlock,
	TrendingUp,
} from "lucide-react";
import { toast } from "sonner";

interface NotificationPrefs {
	enable_in_app: boolean;
	enable_push: boolean;
	enable_email: boolean;
	price_alerts_enabled: boolean;
	wear_reminders_enabled: boolean;
	seasonal_tips_enabled: boolean;
	achievements_enabled: boolean;
	shopping_reminders_in_app: boolean;
	shopping_reminders_push: boolean;
	shopping_reminders_email: boolean;
	cooling_off_ready_in_app: boolean;
	cooling_off_ready_push: boolean;
	cooling_off_ready_email: boolean;
	cost_per_wear_milestones_in_app: boolean;
	cost_per_wear_milestones_push: boolean;
	cost_per_wear_milestones_email: boolean;
	quiet_hours_enabled: boolean;
	quiet_hours_start: string;
	quiet_hours_end: string;
	user_timezone: string;
	max_daily_notifications: number;
	enable_bundling: boolean;
	bundle_threshold: number;
}

export function NotificationPreferences() {
	const [prefs, setPrefs] = useState<NotificationPrefs | null>(null);
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const supabase = createClient();

	// Fetch preferences
	useEffect(() => {
		async function fetchPrefs() {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			const { data, error } = await supabase
				.from("notification_preferences")
				.select("*")
				.eq("user_id", user.id)
				.single();

			if (error) {
				console.error("Error fetching preferences:", error);
				toast.error("Failed to load preferences");
				return;
			}

			setPrefs(data);
			setIsLoading(false);
		}

		fetchPrefs();
	}, [supabase]);

	// Save preferences
	const savePreferences = async (updates: Partial<NotificationPrefs>) => {
		if (!prefs) return;

		setIsSaving(true);

		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) throw new Error("Not authenticated");

			const { error } = await supabase
				.from("notification_preferences")
				.update(updates)
				.eq("user_id", user.id);

			if (error) throw error;

			setPrefs({ ...prefs, ...updates });
			toast.success("Preferences saved");
		} catch (error: any) {
			console.error("Error saving preferences:", error);
			toast.error("Failed to save preferences");
		} finally {
			setIsSaving(false);
		}
	};

	// Test notification
	const sendTestNotification = async () => {
		try {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) return;

			// Create test notification via service
			const response = await fetch("/api/notifications/test", {
				method: "POST",
			});

			if (!response.ok) throw new Error("Failed to send test notification");

			toast.success("Test notification sent! Check your notification center.");
		} catch (error: any) {
			console.error("Error sending test:", error);
			toast.error("Failed to send test notification");
		}
	};

	if (isLoading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Notification Preferences</CardTitle>
				</CardHeader>
				<CardContent>
					<div className='animate-pulse space-y-4'>
						<div className='h-10 bg-muted rounded' />
						<div className='h-10 bg-muted rounded' />
						<div className='h-10 bg-muted rounded' />
					</div>
				</CardContent>
			</Card>
		);
	}

	if (!prefs) return null;

	return (
		<Card className='border-stone-200 bg-muted px-8 py-8'>
			<CardHeader className='border-b border-stone-200 pb-4'>
				<CardTitle className='flex items-center gap-2'>
					<Bell className='h-5 w-5 text-sun-400' />
					Notification Preferences
				</CardTitle>
				<CardDescription>
					Control how and when you receive notifications
				</CardDescription>
			</CardHeader>

			<CardContent className='space-y-6 pt-6'>
				{/* NOTIFICATION CHANNELS */}
				<div>
					<h3 className='text-sm font-semibold mb-3'>Notification Channels</h3>
					<div className='space-y-3'>
						{/* In-App Notifications */}
						<div className=' dense flex items-center justify-between'>
							<div>
								<Label htmlFor='in-app'>In-App Notifications</Label>
								<p className='text-xs text-muted-foreground'>
									Show notifications in the app
								</p>
							</div>
							<Switch
								id='in-app'
								checked={prefs.enable_in_app}
								onCheckedChange={(checked) =>
									savePreferences({ enable_in_app: checked })
								}
								className='dense'
							/>
						</div>

						{/* Push Notifications */}
						<div className='dense flex items-center justify-between opacity-50'>
							<div>
								<Label htmlFor='push'>Push Notifications</Label>
								<p className='text-xs text-muted-foreground'>
									Browser push notifications (coming soon)
								</p>
							</div>
							<Switch
								id='push'
								checked={prefs.enable_push}
								disabled
								className='dense'
							/>
						</div>

						{/* Email Notifications */}
						<div className=' dense flex items-center justify-between opacity-50'>
							<div>
								<Label htmlFor='email'>Email Notifications</Label>
								<p className='text-xs text-muted-foreground'>
									Get notified via email (coming soon)
								</p>
							</div>
							<Switch
								id='email'
								checked={prefs.enable_email}
								disabled
								className='dense'
							/>
						</div>
					</div>
				</div>

				{/* NOTIFICATION TYPES */}
				<div className='border-t border-stone-200 pt-6'>
					<h3 className='text-sm font-semibold mb-3'>Notification Types</h3>
					<div className='space-y-3'>
						{/* Price Alerts */}
						<div className=' dense flex items-center justify-between space-y-4'>
							<div className='flex items-start gap-4'>
								<div className='flex gap-x-4'>
									<Tag className='h-4 w-4 text-muted-foreground' />
									<div className=''>
										<Label htmlFor='price-alerts'>Price Alerts</Label>
										<p className='text-xs text-muted-foreground'>
											Price drops on wishlist items
										</p>
									</div>
								</div>
							</div>
							<Switch
								id='price-alerts'
								checked={prefs.price_alerts_enabled}
								onCheckedChange={(checked) =>
									savePreferences({ price_alerts_enabled: checked })
								}
								className='dense'
							/>
						</div>

						{/* Wear Reminders */}
						<div className=' dense flex items-center justify-between space-y-4'>
							<div className='flex items-start gap-4'>
								<div className='flex gap-x-4'>
									<Package className='h-4 w-4 text-muted-foreground' />
									<div className=''>
										<Label htmlFor='wear-reminders'>Wear Reminders</Label>
										<p className='text-xs text-muted-foreground'>
											Items unworn for 30+ days
										</p>
									</div>
								</div>
							</div>
							<Switch
								id='wear-reminders'
								checked={prefs.wear_reminders_enabled}
								onCheckedChange={(checked) =>
									savePreferences({ wear_reminders_enabled: checked })
								}
								className='dense'
							/>
						</div>

						{/* Seasonal Tips */}
						<div className=' dense flex items-center justify-between space-y-4'>
							<div className='flex items-start gap-4'>
								<div className='flex gap-x-4'>
									<Sparkles className='h-4 w-4 text-muted-foreground' />
									<div className=''>
										<Label htmlFor='seasonal-tips'>Seasonal Tips</Label>
										<p className='text-xs text-muted-foreground'>
											Wardrobe suggestions for each season
										</p>
									</div>
								</div>
							</div>
							<Switch
								id='seasonal-tips'
								checked={prefs.seasonal_tips_enabled}
								onCheckedChange={(checked) =>
									savePreferences({ seasonal_tips_enabled: checked })
								}
								className='dense'
							/>
						</div>

						{/* Achievements */}
						<div className=' dense flex items-center justify-between space-y-4'>
							<div className='flex items-start gap-4'>
								<div className='flex gap-x-4'>
									<Trophy className='h-4 w-4 text-muted-foreground' />
									<div className=''>
										<Label htmlFor='achievements'>Achievements</Label>
										<p className='text-xs text-muted-foreground'>
											When you unlock new achievements
										</p>
									</div>
								</div>
							</div>
							<Switch
								id='achievements'
								checked={prefs.achievements_enabled}
								onCheckedChange={(checked) =>
									savePreferences({ achievements_enabled: checked })
								}
								className='dense'
							/>
						</div>

						{/* Shopping Reminders */}
						<div className=' dense flex items-center justify-between space-y-4'>
							<div className='flex items-start gap-4'>
								<div className='flex gap-x-4'>
									<ShoppingBag className='h-4 w-4 text-muted-foreground' />
									<div className=''>
										<Label htmlFor='shopping-reminders'>
											Shopping Reminders
										</Label>
										<p className='text-xs text-muted-foreground'>
											Gentle reminders to use what you have
										</p>
									</div>
								</div>
							</div>
							<Switch
								id='shopping-reminders'
								checked={prefs.shopping_reminders_in_app}
								onCheckedChange={(checked) =>
									savePreferences({ shopping_reminders_in_app: checked })
								}
								className='dense'
							/>
						</div>

						{/* Cooling-Off Ready */}
						<div className=' dense flex items-center justify-between space-y-4'>
							<div className='flex items-start gap-4'>
								<div className='flex gap-x-4'>
									<Unlock className='h-4 w-4 text-muted-foreground' />
									<div className=''>
										<Label htmlFor='cooling-off'>
											Cooling-Off Period Complete
										</Label>
										<p className='text-xs text-muted-foreground'>
											Notify when wishlist items are ready to purchase
										</p>
									</div>
								</div>
							</div>
							<Switch
								id='cooling-off'
								checked={prefs.cooling_off_ready_in_app}
								onCheckedChange={(checked) =>
									savePreferences({ cooling_off_ready_in_app: checked })
								}
								className='dense'
							/>
						</div>

						{/* Cost-Per-Wear Milestones */}
						<div className=' dense flex items-center justify-between space-y-4'>
							<div className='flex items-start gap-4'>
								<div className='flex gap-x-4'>
									<TrendingUp className='h-4 w-4 text-muted-foreground' />
									<div className=''>
										<Label htmlFor='cpw-milestones'>
											Cost-Per-Wear Milestones
										</Label>
										<p className='text-xs text-muted-foreground'>
											Celebrate when items reach cost-per-wear goals
										</p>
									</div>
								</div>
							</div>
							<Switch
								id='cpw-milestones'
								checked={prefs.cost_per_wear_milestones_in_app}
								onCheckedChange={(checked) =>
									savePreferences({ cost_per_wear_milestones_in_app: checked })
								}
								className='dense'
							/>
						</div>
					</div>
				</div>

				{/* QUIET HOURS */}
				<div className='border-t border-stone-200 pt-6'>
					<div className=' dense flex items-center justify-between space-y-4'>
						<div className='flex items-center gap-4'>
							<div className='flex gap-x-4'>
								<Clock className='h-4 w-4 text-muted-foreground' />
	<div className=''>
										<Label htmlFor='cpw-milestones'>
											Quiet Hours
										</Label>
										<p className='text-xs text-muted-foreground'>
											Get some Quiet Hours goals
										</p>
									</div>

							
							</div>
						</div>
						<Switch
							id='quiet-hours'
							checked={prefs.quiet_hours_enabled}
							onCheckedChange={(checked) =>
								savePreferences({ quiet_hours_enabled: checked })
							}
							className='dense'
						/>
					</div>

					{prefs.quiet_hours_enabled && (
						<div className='dense space-y-3 mt-4 p-3 rounded-lg bg-muted/50'>
							<div className='grid grid-cols-2 gap-3'>
								<div>
									<Label htmlFor='quiet-start' className='text-xs'>
										Start Time
									</Label>
									<Select
										value={prefs.quiet_hours_start}
										onValueChange={(value) =>
											savePreferences({ quiet_hours_start: value })
										}>
										<SelectTrigger id='quiet-start' className='dense mt-1 h-9'>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{generateTimeOptions().map((time) => (
												<SelectItem key={time} value={time}>
													{formatTime(time)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>

								<div>
									<Label htmlFor='quiet-end' className='text-xs'>
										End Time
									</Label>
									<Select
										value={prefs.quiet_hours_end}
										onValueChange={(value) =>
											savePreferences({ quiet_hours_end: value })
										}>
										<SelectTrigger id='quiet-end' className='dense mt-1 h-9'>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{generateTimeOptions().map((time) => (
												<SelectItem key={time} value={time}>
													{formatTime(time)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							</div>

							<p className='text-xs text-muted-foreground'>
								No notifications will be created during quiet hours. Your
								timezone: {prefs.user_timezone}
							</p>
						</div>
					)}
				</div>

				{/* BUNDLING PREFERENCES */}
				<div className='border-t border-stone-200 pt-6'>
					<div className='dense flex items-center justify-between mb-3'>
						<div>
							<h3 className='text-sm font-semibold'>Smart Bundling</h3>
							<p className='text-xs text-muted-foreground'>
								Group similar notifications to reduce clutter
							</p>
						</div>
						<Switch
							id='bundling'
							checked={prefs.enable_bundling}
							onCheckedChange={(checked) =>
								savePreferences({ enable_bundling: checked })
							}
							className='dense'
						/>
					</div>

					{prefs.enable_bundling && (
						<div className='dense mt-4 p-3 rounded-lg bg-muted/50'>
							<Label htmlFor='bundle-threshold' className='text-xs'>
								Bundle when {prefs.bundle_threshold}+ similar notifications
							</Label>
							<Slider
								id='bundle-threshold'
								min={2}
								max={10}
								step={1}
								value={[prefs.bundle_threshold]}
								onValueChange={([value]) =>
									savePreferences({ bundle_threshold: value })
								}
								className='mt-2'
							/>
							<p className='text-xs text-muted-foreground mt-2'>
								Example: 3 unworn items become "3 items need wear"
							</p>
						</div>
					)}
				</div>

				{/* MAX DAILY NOTIFICATIONS */}
				<div className='border-t border-stone-200 pt-6'>
					<div className='dense'>
						<Label htmlFor='max-daily' className='text-sm font-semibold'>
							Max Daily Notifications: {prefs.max_daily_notifications}
						</Label>
						<p className='text-xs text-muted-foreground mb-3'>
							Limit how many notifications you receive per day
						</p>

						<Slider
							id='max-daily'
							min={1}
							max={50}
							step={1}
							value={[prefs.max_daily_notifications]}
							onValueChange={([value]) =>
								savePreferences({ max_daily_notifications: value })
							}
						/>
					</div>
				</div>

				{/* TEST NOTIFICATION */}
				<div className='border-t border-stone-200 pt-6'>
					<div className='flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200'>
						<AlertCircle className='h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5' />
						<div className='flex-1'>
							<h4 className='text-sm font-semibold text-blue-900 mb-1'>
								Test Your Notifications
							</h4>
							<p className='text-xs text-blue-700 mb-3'>
								Send a test notification to see how it looks
							</p>
							<Button
								variant='outline'
								size='sm'
								onClick={sendTestNotification}
								className='dense h-8 border-blue-300 text-blue-700 hover:bg-blue-100'>
								Send Test Notification
							</Button>
						</div>
					</div>
				</div>
			</CardContent>
		</Card>
	);
}

// Helper: Generate time options (HH:MM)
function generateTimeOptions() {
	const times: string[] = [];
	for (let hour = 0; hour < 24; hour++) {
		for (let minute = 0; minute < 60; minute += 30) {
			const h = hour.toString().padStart(2, "0");
			const m = minute.toString().padStart(2, "0");
			times.push(`${h}:${m}`);
		}
	}
	return times;
}

// Helper: Format time for display (12-hour format)
function formatTime(time24: string) {
	const [hour, minute] = time24.split(":").map(Number);
	const period = hour >= 12 ? "PM" : "AM";
	const hour12 = hour % 12 || 12;
	return `${hour12}:${minute.toString().padStart(2, "0")} ${period}`;
}
