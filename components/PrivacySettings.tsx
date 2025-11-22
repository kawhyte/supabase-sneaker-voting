"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Globe, Lock, Users, Info } from "lucide-react";

type WishlistPrivacy = "private" | "followers_only" | "public";

export function PrivacySettings() {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [wishlistPrivacy, setWishlistPrivacy] =
		useState<WishlistPrivacy>("private");
	const [followerCount, setFollowerCount] = useState(0);
	const [followingCount, setFollowingCount] = useState(0);
	const [hasChanges, setHasChanges] = useState(false);
	const [initialPrivacy, setInitialPrivacy] =
		useState<WishlistPrivacy>("private");

	const supabase = createClient();

	// Load current settings
	useEffect(() => {
		async function loadSettings() {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (!user) return;

				const { data: profile, error } = await supabase
					.from("profiles")
					.select("wishlist_privacy, follower_count, following_count")
					.eq("id", user.id)
					.single();

				if (error) throw error;

				if (profile) {
					const privacy =
						(profile.wishlist_privacy as WishlistPrivacy) || "private";
					setWishlistPrivacy(privacy);
					setInitialPrivacy(privacy);
					setFollowerCount(profile.follower_count || 0);
					setFollowingCount(profile.following_count || 0);
				}
			} catch (error) {
				console.error("Error loading privacy settings:", error);
				toast.error("Failed to load privacy settings");
			} finally {
				setLoading(false);
			}
		}

		loadSettings();
	}, [supabase]);

	// Track changes
	useEffect(() => {
		setHasChanges(wishlistPrivacy !== initialPrivacy);
	}, [wishlistPrivacy, initialPrivacy]);

	const handleSave = async () => {
		try {
			setSaving(true);

			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				toast.error("Not authenticated");
				return;
			}

			const { error } = await supabase
				.from("profiles")
				.update({ wishlist_privacy: wishlistPrivacy })
				.eq("id", user.id);

			if (error) throw error;

			setInitialPrivacy(wishlistPrivacy);
			setHasChanges(false);
			toast.success("Privacy settings saved!");
		} catch (error) {
			console.error("Error saving privacy settings:", error);
			toast.error("Failed to save settings");
		} finally {
			setSaving(false);
		}
	};

	const privacyOptions = [
		{
			value: "private" as const,
			label: "Private",
			icon: Lock,
			description: "Only you can see your wishlist",
			details:
				"Your wishlist items remain completely private. Perfect if you prefer to keep your shopping plans to yourself.",
		},
		{
			value: "followers_only" as const,
			label: "Followers Only",
			icon: Users,
			description: "Only your followers can see your wishlist",
			details:
				"People you approve can see what you're shopping for. Great for sharing with close friends and family.",
		},
		{
			value: "public" as const,
			label: "Public",
			icon: Globe,
			description: "Anyone can see your wishlist",
			details:
				"Your wishlist appears in Explore and can be viewed by anyone. Ideal for building a public collection or getting community feedback.",
		},
	];

	const selectedOption = privacyOptions.find(
		(opt) => opt.value === wishlistPrivacy
	);
	const Icon = selectedOption?.icon || Lock;

	if (loading) {
		return (
			<div className='w-full py-8 flex items-center justify-center'>
				<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-primary'></div>
			</div>
		);
	}

	return (
		<div className='space-y-6'>
			{/* Social Stats */}
			<Card>
				<CardHeader>
					<CardTitle className='text-xl'>Your Social Stats</CardTitle>
					<CardDescription>Connect with other sneakerheads</CardDescription>
				</CardHeader>
				<CardContent>
					<div className='grid grid-cols-2 gap-4'>
						<div className='flex flex-col items-center p-4 bg-muted rounded-lg'>
							<div className='text-3xl font-bold text-foreground'>
								{followerCount}
							</div>
							<div className='text-sm text-muted-foreground'>Followers</div>
						</div>
						<div className='flex flex-col items-center p-4 bg-muted rounded-lg'>
							<div className='text-3xl font-bold text-foreground'>
								{followingCount}
							</div>
							<div className='text-sm text-muted-foreground'>Following</div>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Privacy Settings */}
			<Card>
				<CardHeader>
					<CardTitle className='text-xl'>Wishlist Privacy</CardTitle>
					<CardDescription>
						Choose who can see your wishlist items
					</CardDescription>
				</CardHeader>
				<CardContent className='space-y-6'>
					{/* Privacy Selector */}
					<div className='space-y-2'>
						<label className='text-sm font-medium'>Privacy Level</label>
						<Select
							value={wishlistPrivacy}
							onValueChange={(value) =>
								setWishlistPrivacy(value as WishlistPrivacy)
							}>
							<SelectTrigger className='w-full'>
								<SelectValue placeholder='Select privacy level' />
							</SelectTrigger>
							<SelectContent>
								{privacyOptions.map((option) => {
									const OptionIcon = option.icon;
									return (
										<SelectItem key={option.value} value={option.value}>
											<div className='flex items-center gap-2'>
												<OptionIcon className='h-4 w-4' />
												<span>{option.label}</span>
											</div>
										</SelectItem>
									);
								})}
							</SelectContent>
						</Select>
					</div>

					{/* Current Selection Info */}
					<div className='flex items-start gap-3 p-4 bg-muted rounded-lg'>
						<Icon className='h-5 w-5 text-primary mt-0.5' />
						<div className='flex-1'>
							<div className='font-semibold mb-1'>{selectedOption?.label}</div>
							<div className='text-sm text-muted-foreground mb-2'>
								{selectedOption?.description}
							</div>
							<div className='text-sm text-muted-foreground'>
								{selectedOption?.details}
							</div>
						</div>
					</div>

					{/* Important Notes */}
					<div className='flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800'>
						<Info className='h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5' />
						<div className='flex-1 text-sm text-blue-900 dark:text-blue-100'>
							<div className='font-semibold mb-2'>Important Notes:</div>
							<ul className='space-y-1 list-disc list-inside'>
								<li>
									Only <strong>wishlist items</strong> are affected by this
									setting
								</li>
								<li>
									Your <strong>owned items</strong> (Sneakers & Apparel)
									remain private
								</li>
								<li>
									You can pin specific wishlist items to feature them on your
									profile
								</li>
							</ul>
						</div>
					</div>

					{/* Save Button */}
					<div className='flex items-center justify-between pt-4 border-t'>
						<div className='text-sm text-muted-foreground'>
							{hasChanges && "• Unsaved changes"}
						</div>
						<Button
							onClick={handleSave}
							disabled={!hasChanges || saving}
							className='bg-sun-400 text-slate-900 hover:bg-sun-500'>
							{saving ? "Saving..." : "Save Changes"}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
