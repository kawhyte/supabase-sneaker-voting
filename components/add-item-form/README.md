# AddItemForm Section Components

This directory contains the extracted section components from the monolithic `AddItemForm.tsx` component (1580 lines). Each section handles a specific group of form fields with proper validation and conditional rendering.

## Component Breakdown

### 1. BasicInfoSection.tsx (4.9KB)
**Lines extracted:** 1023-1130 from AddItemForm.tsx

**Contains:**
- Brand selection (BrandCombobox with logos)
- Item name/model (required text input)
- Category dropdown (shoes, tops, bottoms, outerwear, accessories)
- "Tried On" toggle switch with visual feedback (CheckCircle icon when enabled)

**Props:**
```typescript
interface BasicInfoSectionProps {
  form: UseFormReturn<any>;
}
```

**Key Features:**
- Auto-syncs brand name when brand ID is selected
- Shows "Great!" message when tried-on toggle is enabled
- Responsive 2-column grid layout
- Required field indicators (red asterisks)

---

### 2. PricingSection.tsx (3.3KB)
**Lines extracted:** 1164-1240 from AddItemForm.tsx

**Contains:**
- Retail price input (required, $ prefix)
- Target price input (required, $ prefix)
- Sale alert component (animated, appears when sale detected)

**Props:**
```typescript
interface PricingSectionProps {
  form: UseFormReturn<any>;
}
```

**Key Features:**
- Automatic sale detection (sale price < retail price)
- Savings calculation ($ amount and % off)
- Animated fade-in for sale alert
- ARIA live region for screen readers
- Responsive 2-column grid layout

---

### 3. SizingSection.tsx (5.2KB)
**Lines extracted:** 1380-1529 (Accordion content) from AddItemForm.tsx

**Contains:**
- SKU / Style Code (optional text input)
- Color (optional text input)
- Size Tried (conditional: SizeCombobox for shoes, ClothingSizeCombobox for clothing)
- Notes textarea (120 character limit with counter)
- Times Worn input (edit mode only, owned items only)
- Comfort Rating (conditional: 1-5 stars when tried on)

**Props:**
```typescript
interface SizingSectionProps {
  form: UseFormReturn<any>;
  openAccordionItem: string;
  setOpenAccordionItem: (value: string) => void;
  mode: "create" | "edit";
  initialData?: any;
  formMode: "quick" | "advanced";
}
```

**Key Features:**
- Only renders in "advanced" form mode
- Auto-opens accordion when "Tried On" is toggled
- Conditional size input based on category (shoes vs clothing)
- Character counter for notes field
- Wears tracking for owned items only

---

### 4. PhotoSection.tsx (1.6KB)
**Lines extracted:** 1354-1377 from AddItemForm.tsx

**Contains:**
- MultiPhotoUpload widget
- Photo requirement text (Min 1, Max 5)
- Error message when no photos uploaded

**Props:**
```typescript
interface PhotoSectionProps {
  photos: PhotoItem[];
  onPhotosChange: (photos: PhotoItem[]) => void;
  errors?: any;
}
```

**Key Features:**
- Drag-and-drop photo upload
- Photo reordering with DnD Kit
- Main image selection
- Delete functionality
- 5 photo maximum limit

---

### 5. ProductURLSection.tsx (6.5KB)
**Lines extracted:** 1133-1161 (URL input) + 1243-1350 (Price tracking) from AddItemForm.tsx

**Contains:**
- Product URL input field
- "Import" button to trigger auto-fill
- Price tracking toggle switch
- URL validation feedback (success/warning/error states)
- Supported retailers dialog link
- Failure warnings (edit mode only)

**Props:**
```typescript
interface ProductURLSectionProps {
  form: UseFormReturn<any>;
  isScrapingUrl: boolean;
  uploadProgress: string;
  urlValidation: UrlValidationResult;
  onUrlScrape: (url: string) => void;
  onShowRetailersDialog: () => void;
  mode: "create" | "edit";
  initialData?: any;
}
```

**Key Features:**
- Real-time URL validation when price tracking enabled
- Loading state during import
- Conditional rendering (only for create mode or wishlisted items)
- Failure tracking display (shows count when ≥ 2 failures)
- Retailer support information (shows count of supported retailers)

---

### 6. FormActions.tsx (1.2KB)
**Lines extracted:** 1531-1546 from AddItemForm.tsx

**Contains:**
- Submit button with loading states
- Dynamic button text (Save Item / Update Item / Saving photos...)

**Props:**
```typescript
interface FormActionsProps {
  isLoading: boolean;
  isSavingPhotos: boolean;
  isValid: boolean;
  isDirty: boolean;
  photosLength: number;
  mode: "create" | "edit";
}
```

**Key Features:**
- Disabled states based on validation
- Loading spinner during submission
- Mode-aware button text
- Photo count validation (min 1 required for create mode)

---

## Architecture Notes

### Form Control Pattern
All components accept `form: UseFormReturn<any>` as a prop and extract:
- `register` - For field registration
- `watch` - For reactive field values
- `setValue` - For programmatic updates
- `formState: { errors }` - For validation errors

### Validation
- All validation logic remains in parent component's Zod schema
- Components only display error messages
- Error messages are converted to strings with fallbacks
- Required fields marked with red asterisks

### Conditional Rendering
- **SizingSection**: Only shows in "advanced" mode
- **ProductURLSection**: Only shows for create mode or wishlisted items
- **Size inputs**: Conditional based on category (shoes vs clothing)
- **Comfort rating**: Conditional based on category requirements
- **Wears input**: Only in edit mode for owned items

### Responsive Design
- All sections use responsive grid layouts (grid-cols-1 md:grid-cols-2)
- Mobile-first approach with breakpoints
- Proper spacing with 8px grid system (gap-6 = 24px)

---

## Usage Example

```typescript
import {
  BasicInfoSection,
  PricingSection,
  SizingSection,
  PhotoSection,
  ProductURLSection,
  FormActions,
} from "@/components/add-item-form";

export function AddItemFormOrchestrator() {
  const form = useForm({...});
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <BasicInfoSection form={form} />
      <PricingSection form={form} />
      <PhotoSection 
        photos={photos}
        onPhotosChange={setPhotos}
        errors={form.formState.errors}
      />
      <ProductURLSection
        form={form}
        isScrapingUrl={isScrapingUrl}
        uploadProgress={uploadProgress}
        urlValidation={urlValidation}
        onUrlScrape={handleUrlScrape}
        onShowRetailersDialog={() => setShowRetailersDialog(true)}
        mode={mode}
        initialData={initialData}
      />
      <SizingSection
        form={form}
        openAccordionItem={openAccordionItem}
        setOpenAccordionItem={setOpenAccordionItem}
        mode={mode}
        initialData={initialData}
        formMode={formMode}
      />
      <FormActions
        isLoading={isLoading}
        isSavingPhotos={isSavingPhotos}
        isValid={form.formState.isValid}
        isDirty={form.formState.isDirty}
        photosLength={photos.length}
        mode={mode}
      />
    </form>
  );
}
```

---

## File Sizes
- BasicInfoSection.tsx: 4.9KB
- PricingSection.tsx: 3.3KB
- SizingSection.tsx: 5.2KB
- PhotoSection.tsx: 1.6KB
- ProductURLSection.tsx: 6.5KB
- FormActions.tsx: 1.2KB
- index.ts: 1.3KB

**Total:** ~23KB (extracted from 1580-line monolithic component)

---

## TypeScript Build Status
✅ All components pass TypeScript compilation (`npx tsc --noEmit`)
✅ No type errors in extracted components
✅ Proper error message type handling (converted to strings)

---

## Next Steps (Not Included)
1. Create orchestrator component to use these sections
2. Update AddItemForm.tsx to use new sections
3. Test all validation flows
4. Verify conditional rendering logic
5. Test responsive layouts
6. Verify accessibility (ARIA labels, keyboard navigation)
