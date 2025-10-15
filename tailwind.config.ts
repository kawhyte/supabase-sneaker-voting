/* ============================================
   🎨 TAILWIND CSS V4 CONFIGURATION

   IMPORTANT: In Tailwind v4, design tokens (colors, spacing,
   typography) are defined in globals.css using @theme.

   This file is minimal and only contains:
   - Content paths for file scanning
   - Dark mode configuration
   - Plugin registrations

   DO NOT add colors, spacing, or typography here!
   All design system tokens live in app/globals.css
   ============================================ */

const config = {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	plugins: [
		// Line clamp plugin for multi-line text truncation
		require("@tailwindcss/line-clamp"),
	],
}

export default config;
