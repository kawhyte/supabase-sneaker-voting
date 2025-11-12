/**
 * Manual Price Entry Dialog
 *
 * Allows users to manually enter a price when automatic scraping fails.
 * Stores entry in price_check_log with source='user_entry' for transparency.
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DollarSign, AlertCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { toast } from 'sonner';

interface ManualPriceEntryDialogProps {
  itemId: string;
  itemName: string; // e.g., "Nike Air Max 90"
  retailPrice?: number | null;
  currentPrice?: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void; // Callback to reload data
}

export function ManualPriceEntryDialog({
  itemId,
  itemName,
  retailPrice,
  currentPrice,
  isOpen,
  onClose,
  onSuccess,
}: ManualPriceEntryDialogProps) {
  const [priceInput, setPriceInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const supabase = createClient();

  const handleSubmit = async () => {
    // Validate input
    const price = parseFloat(priceInput);
    if (isNaN(price) || price <= 0) {
      toast.error('Please enter a valid price');
      return;
    }

    if (price > 50000) {
      toast.error('Price seems too high. Please check and try again.');
      return;
    }

    // Warn if price is very different from retail
    if (retailPrice && price > retailPrice * 1.5) {
      const proceed = window.confirm(
        `This price ($${price}) is 50% higher than retail ($${retailPrice}). Continue anyway?`
      );
      if (!proceed) return;
    }

    try {
      setIsSubmitting(true);

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('You must be logged in');
        return;
      }

      // Update item's sale_price
      const { error: updateError } = await supabase
        .from('items')
        .update({
          sale_price: price,
          last_price_check_at: new Date().toISOString(),
          price_check_failures: 0, // Reset failures on manual entry
        })
        .eq('id', itemId);

      if (updateError) {
        console.error('Error updating item:', updateError);
        toast.error('Failed to save price');
        return;
      }

      // Log to price_check_log (for transparency)
      await supabase.from('price_check_log').insert({
        item_id: itemId,
        user_id: user.id,
        price: price,
        checked_at: new Date().toISOString(),
        source: 'user_entry',
        retailer: 'Manual Entry',
        success: true,
      });

      // Log to price_history (for trend tracking)
      await supabase.from('price_history').insert({
        item_id: itemId,
        user_id: user.id,
        price: price,
        checked_at: new Date().toISOString(),
        source: 'manual_entry',
      });

      toast.success('Price updated! 💰', {
        description: `${itemName} is now $${price}`,
      });

      // Reset and close
      setPriceInput('');
      onSuccess();
      onClose();

    } catch (error) {
      console.error('Error saving manual price:', error);
      toast.error('Failed to save price. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setPriceInput('');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manual Price Entry</DialogTitle>
          <DialogDescription>
            Enter the current price for <strong>{itemName}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Prices */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>Retail Price:</span>
            <span className="font-medium">
              {retailPrice ? `$${retailPrice.toFixed(2)}` : 'N/A'}
            </span>
          </div>

          {currentPrice && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Last Known Price:</span>
              <span className="font-medium">${currentPrice.toFixed(2)}</span>
            </div>
          )}

          {/* Price Input */}
          <div className="space-y-2">
            <Label htmlFor="manual-price">Current Price</Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="manual-price"
                type="number"
                step="0.01"
                min="0"
                max="50000"
                placeholder="0.00"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="pl-9"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Enter the price you see on the retailer's website
            </p>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 rounded-md bg-amber-50 p-3 text-xs text-amber-800 border border-amber-200">
            <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
            <p>
              Manual prices are marked as "user-reported" in your price history.
              They won't be automatically updated until the next scheduled check.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !priceInput}>
            {isSubmitting ? 'Saving...' : 'Save Price'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
