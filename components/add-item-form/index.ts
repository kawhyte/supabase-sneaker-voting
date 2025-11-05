/**
 * Add Item Form - Section Components
 *
 * This directory contains the extracted section components from the monolithic
 * AddItemForm component (1580 lines). Each section handles a specific group
 * of form fields with proper validation and conditional rendering.
 *
 * Component Breakdown:
 * - BasicInfoSection: Brand, model, category, tried-on toggle (lines 1023-1130)
 * - PricingSection: Retail price, sale price, target price (lines 1164-1240)
 * - SizingSection: Size tried, comfort rating, notes (lines 1380-1529 in accordion)
 * - PhotoSection: Multi-photo upload widget (lines 1354-1377)
 * - ProductURLSection: URL input, price tracking toggle (lines 1133-1350)
 * - FormActions: Submit/Cancel buttons (lines 1531-1546)
 *
 * Architecture:
 * - All components accept UseFormReturn<any> as a prop for form control
 * - Components use React Hook Form's register, watch, setValue, and errors
 * - Validation is handled by Zod schema in parent component
 * - Conditional rendering based on category, mode, and form state
 */

export { BasicInfoSection } from "./BasicInfoSection";
export { PricingSection } from "./PricingSection";
export { SizingSection } from "./SizingSection";
export { PhotoSection } from "./PhotoSection";
export { ProductURLSection } from "./ProductURLSection";
export { FormActions } from "./FormActions";
