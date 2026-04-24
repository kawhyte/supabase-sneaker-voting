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
import { Globe, Lock, Users } from "lucide-react";

type PrivacyLevel = "private" | "followers_only" | "public";

const privacyOptions = [
	{
		value: "private" as const,
		label: "Private",
		icon: Lock,
		description: "Only you can see this",
		details: "Items remain completely private. Perfect if you prefer to keep things to yourself.",
	},
	{
		value: "followers_only" as const,
		label: "Followers Only",
		icon: Users,
		description: "Only your followers can see this",
		details: "People who follow you can see these items. Great for sharing with your community.",
	},
	{
		value: "public" as const,
		label: "Public",
		icon: Globe,
		description: "Anyone can see this",
		details: "Appears in Discover and can be viewed by anyone. Ideal for building a public presence.",
	},
];

function PrivacySelector({
	value,
	onChange,
}: {
	value: PrivacyLevel;
	onChange: (v: PrivacyLevel) => void;
}) {
	const selected = privacyOptions.find((o) => o.value === value) ?? privacyOptions[0];

	return (
		<div className="space-y-1.5">
			<Select value={value} onValueChange={(v) => onChange(v as PrivacyLevel)}>
				<SelectTrigger className="w-full">
					<SelectValue placeholder="Select privacy level" />
				</SelectTrigger>
				<SelectContent>
					{privacyOptions.map((option) => {
						const OptionIcon = option.icon;
						return (
							<SelectItem key={option.value} value={option.value}>
								<div className="flex items-center gap-2">
									<OptionIcon className="h-4 w-4" />
									<span>{option.label}</span>
								</div>
							</SelectItem>
						);
					})}
				</SelectContent>
			</Select>
			<p className="text-xs text-muted-foreground">{selected.description}</p>
			<p className="text-xs text-muted-foreground/70">{selected.details}</p>
		</div>
	);
}

export function PrivacySettings() {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [wishlistPrivacy, setWishlistPrivacy] = useState<PrivacyLevel>("private");
	const [collectionPrivacy, setCollectionPrivacy] = useState<PrivacyLevel>("private");
	const [initialWishlistPrivacy, setInitialWishlistPrivacy] = useState<PrivacyLevel>("private");
	const [initialCollectionPrivacy, setInitialCollectionPrivacy] = useState<PrivacyLevel>("private");

	const hasChanges =
		wishlistPrivacy !== initialWishlistPrivacy ||
		collectionPrivacy !== initialCollectionPrivacy;

	const supabase = createClient();

	useEffect(() => {
		async function loadSettings() {
			try {
				const {
					data: { user },
				} = await supabase.auth.getUser();
				if (!user) return;

				const { data: profile, error } = await supabase
					.from("profiles")
					.select("wishlist_privacy, collection_privacy")
					.eq("id", user.id)
					.single();

				if (error) throw error;

				if (profile) {
					const wPrivacy = (profile.wishlist_privacy as PrivacyLevel) || "private";
					const cPrivacy = (profile.collection_privacy as PrivacyLevel) || "private";
					setWishlistPrivacy(wPrivacy);
					setInitialWishlistPrivacy(wPrivacy);
					setCollectionPrivacy(cPrivacy);
					setInitialCollectionPrivacy(cPrivacy);
				}
			} catch (error) {
				console.error("Error loading privacy settings:", error);
				toast.error("Failed to load privacy settings");
			} finally {
				setLoading(false);
			}
		}

		loadSettings();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

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
				.update({
					wishlist_privacy: wishlistPrivacy,
					collection_privacy: collectionPrivacy,
				})
				.eq("id", user.id);

			if (error) throw error;

			setInitialWishlistPrivacy(wishlistPrivacy);
			setInitialCollectionPrivacy(collectionPrivacy);
			toast.success("Privacy settings saved!");
		} catch (error) {
			console.error("Error saving privacy settings:", error);
			toast.error("Failed to save settings");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="w-full py-8 flex items-center justify-center">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Collection Privacy */}
			<Card>
				<CardHeader>
					<CardTitle className="text-xl">Collection Privacy</CardTitle>
					<CardDescription>
						Choose who can see your owned sneakers
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<label className="text-sm font-medium">Privacy Level</label>
						<PrivacySelector value={collectionPrivacy} onChange={setCollectionPrivacy} />
					</div>
				</CardContent>
			</Card>

			{/* Wishlist Privacy */}
			<Card>
				<CardHeader>
					<CardTitle className="text-xl">Wishlist Privacy</CardTitle>
					<CardDescription>
						Choose who can see your wishlist items
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-6">
					<div className="space-y-2">
						<label className="text-sm font-medium">Privacy Level</label>
						<PrivacySelector value={wishlistPrivacy} onChange={setWishlistPrivacy} />
					</div>
				</CardContent>
			</Card>

			{/* Save */}
			<div className="flex items-center justify-between pt-2">
				<div className="text-sm text-muted-foreground">
					{hasChanges && "• Unsaved changes"}
				</div>
				<Button
					onClick={handleSave}
					disabled={!hasChanges || saving}
					className="bg-primary text-slate-900"
				>
					{saving ? "Saving..." : "Save Changes"}
				</Button>
			</div>
		</div>
	);
}
