"use client";

import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const RadioGroup = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Root>,
    React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
    return (
        <RadioGroupPrimitive.Root
            className={cn("grid gap-2", className)}
            {...props}
            ref={ref}
        />
    );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

// --- 1. Define variants for the outer circle ---
const radioGroupItemVariants = cva(
    "aspect-square rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            size: {
                default: "h-4 w-4",
                sm: "h-3 w-3",
            },
        },
        defaultVariants: {
            size: "default",
        },
    }
);

// --- 2. Define variants for the inner dot ---
const radioIndicatorVariants = cva("fill-current text-current", {
    variants: {
        size: {
            default: "h-2.5 w-2.5",
            sm: "h-2.5 w-2.5",
        },
    },
    defaultVariants: {
        size: "default",
    },
});

// --- 3. Create a new props interface to accept the 'size' variant ---
export interface RadioGroupItemProps
    extends React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>,
        VariantProps<typeof radioGroupItemVariants> {}

const RadioGroupItem = React.forwardRef<
    React.ElementRef<typeof RadioGroupPrimitive.Item>,
    RadioGroupItemProps
>(({ className, size, ...props }, ref) => {
    return (
        <RadioGroupPrimitive.Item
            ref={ref}
            // --- 4. Apply the variants to the component ---
            className={cn(radioGroupItemVariants({ size, className }))}
            {...props}>
            <RadioGroupPrimitive.Indicator className='flex items-center justify-center'>
                <Circle className={cn(radioIndicatorVariants({ size }))} />
            </RadioGroupPrimitive.Indicator>
        </RadioGroupPrimitive.Item>
    );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };

