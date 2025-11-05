"use client";

import React from "react";
import { OutfitWithItems } from "@/components/types/Outfit";
import { OutfitCardCanvas } from "./OutfitCardCanvas";

interface OutfitCardPreviewProps {
	outfit: OutfitWithItems;
	className?: string;
	priority?: boolean;
}

/**
 * Outfit card preview using client-side canvas rendering
 * Renders items with Nike/JD Sports positioning
 */
export function OutfitCardPreview({
	outfit,
	className = "",
	priority = false,
}: OutfitCardPreviewProps) {
	// Render canvas directly - simple and reliable
	return <OutfitCardCanvas outfit={outfit} className={className} />;
}
