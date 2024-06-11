"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { Check, ChevronsUpDown, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { toast } from "./ui/use-toast";
import { useState } from "react";

const languages = [
	{ label: "Jordan", value: "1" },
	{ label: "Nike", value: "2" },
	{ label: "Adidas", value: "3" },
	{ label: "Asics", value: "4" },
	{ label: "New Balance", value: "5" },
	{ label: "Saucony", value: "6" },
	{ label: "Reebok", value: "7" },
	{ label: "Puma", value: "8" },
	{ label: "Other", value: "9" },
] as const;

const formSchema = z.object({
	sneakerName: z.string().min(2, {
		message: "Sneaker name must be at least 2 characters.",
	}),
	mainSneakerImageLink: z.string().url({
		message: "At least 1 sneaker link is required.",
	}),
	sneakerSKU: z.string().min(2, {
		message: "Sneaker SKU must be at least 2 characters.",
	}),
	sneakerBrand: z.string({
		required_error: "Please select a sneaker brand.",
	}),
	// sneakerImageLink: z.string().url({
	// 	message: "Sneaker link is required.",
	// }),

	sneakerImageLink: z
		.array(
			z.object({
				value: z.string().url({ message: "Please enter a valid URL." }),
			})
		)
		.optional(),

	sneakerReleaseDate: z.date({
		required_error: "A sneaker release date is required.",
	}),

	sneakerPrice: z
		.union([
			z.string().transform((x) => x.replace(/[^0-9.-]+/g, "")),
			z.number(),
		])
		.pipe(z.coerce.number().min(0.0001).max(999999999)),

	//   sneakerPrice: z.object({
	//   type1: z.string(),
	//   type2: z.string(),
	//   type4: z.string().transform((val) => {
	//     if (val.length !== 5) throw new Error('Type4 must have 5 digits')
	//     return parseInt(val, 10)
	//   }),
	//   type5: z.number()
	// }),
});

export function CreateForm() {
	const [main_image, setImage] = useState("");
	// 1. Define your form.
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			sneakerName: "",
			sneakerSKU: "",
			sneakerPrice: 0,
			mainSneakerImageLink: "",
			sneakerImageLink: [
				
			],
			
		},
	});

	const { fields, append, remove } = useFieldArray({
		name: "sneakerImageLink",
		control: form.control,
	});
	// 2. Define a submit handler.
	function onSubmit(values: z.infer<typeof formSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.

		toast({
			title: "Added to Databse",
			description: (
				<pre>
					<p> "Item added to the Repo"</p>
				</pre>
			),
		});
		console.log(values);
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
				<div className='mb-6'>
					<img
						src={
							main_image === ""
								? "https://placehold.co/600x290?text=Sneaker+Image"
								: main_image
						}
						alt='Sneaker'
					/>
				</div>

				<FormField
					control={form.control}
					name='sneakerName'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Sneaker Name</FormLabel>
							<FormControl>
								<Input placeholder='Air Jordan 1 ' {...field} />
							</FormControl>
							{/* <FormDescription>
                The display name of the Sneaker.
              </FormDescription> */}
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='sneakerSKU'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Sneaker SKU/STYLE</FormLabel>
							<FormControl>
								<Input placeholder='AQ9129 500 ' {...field} />
							</FormControl>
							{/* <FormDescription>
                The display name of the Sneaker.
              </FormDescription> */}
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name='sneakerPrice'
					render={({ field }) => (
						<FormItem>
							<FormLabel>Retail Price</FormLabel>
							<FormControl>
								<Input placeholder='210 ' {...field} />
							</FormControl>
							{/* <FormDescription>
                The display name of the Sneaker.
              </FormDescription> */}
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='sneakerBrand'
					render={({ field }) => (
						<FormItem className='flex flex-col'>
							<FormLabel>Sneaker Brand</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant='outline'
											role='combobox'
											className={cn(
												"w-[200px] justify-between",
												!field.value && "text-muted-foreground"
											)}>
											{field.value
												? languages.find(
														(language) => language.value === field.value
												  )?.label
												: "Select Brand"}
											<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className='w-[200px] p-0'>
									<Command>
										<CommandInput placeholder='Search brand...' />
										<CommandEmpty>No brand found.</CommandEmpty>
										<CommandGroup>
											<CommandList>
												{languages.map((language) => (
													<CommandItem
														value={language.label}
														key={language.value}
														onSelect={() => {
															form.setValue("sneakerBrand", language.value);
														}}>
														<Check
															className={cn(
																"mr-2 h-4 w-4",
																language.value === field.value
																	? "opacity-100"
																	: "opacity-0"
															)}
														/>
														{language.label}
													</CommandItem>
												))}
											</CommandList>
										</CommandGroup>
									</Command>
								</PopoverContent>
							</Popover>
							{/* <FormDescription>
                This is the language that will be used in the dashboard.
              </FormDescription> */}
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name='sneakerReleaseDate'
					render={({ field }) => (
						<FormItem className='flex flex-col'>
							<FormLabel>Date of birth</FormLabel>
							<Popover>
								<PopoverTrigger asChild>
									<FormControl>
										<Button
											variant={"outline"}
											className={cn(
												"w-[240px] pl-3 text-left font-normal",
												!field.value && "text-muted-foreground"
											)}>
											{field.value ? (
												format(field.value, "PPP")
											) : (
												<span>Pick a date</span>
											)}
											<CalendarIcon className='ml-auto h-4 w-4 opacity-50' />
										</Button>
									</FormControl>
								</PopoverTrigger>
								<PopoverContent className='w-auto p-0' align='start'>
									<Calendar
										mode='single'
										selected={field.value}
										onSelect={field.onChange}
										disabled={(date) =>
											date > new Date() || date < new Date("1900-01-01")
										}
										initialFocus
									/>
								</PopoverContent>
							</Popover>
							{/* <FormDescription>
                Your date of birth is used to calculate your age.
              </FormDescription> */}
							<FormMessage />
						</FormItem>
					)}
				/>

				<div>
					<FormField
						control={form.control}
						name='mainSneakerImageLink'
						render={({ field }) => (
<> 
							<FormItem>
								<FormLabel>Main Image URL</FormLabel>
								<FormControl onBlur={() => setImage(field.value)}>
									<Input placeholder='https:// ' {...field} />
								</FormControl>
								{/* <FormDescription>
                The display name of the Sneaker.
              </FormDescription> */}
								<FormMessage />
							</FormItem>
              </>
						)}
					/>
					{fields.map((field, index) => (
						<FormField
							control={form.control}
							key={field.id}
							name={`sneakerImageLink.${index}.value`}
							render={({ field }) => (
								<FormItem>
									{/* <FormLabel className={cn(index !== 0 && "sr-only")}>
										Additional URLs
									</FormLabel> */}
									<FormDescription className={cn(index !== 0 && "sr-only")}>
										Additional links for the sneaker.
									</FormDescription>
									<FormControl>
										<div className='flex justify-between items-center'>
											<Input {...field} />
											<Button
												type='button'
												variant='outline'
												size='sm'
												className='ml-2'
												onClick={() => remove(index)}>
												Remove
											</Button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					))}
					<Button
						type='button'
						variant='outline'
						size='sm'
						className='mt-2'
						onClick={() => append({ value: "" })}>
						Add more Sneaker URLs
					</Button>
				</div>
				<Button type='submit'>Submit</Button>
			</form>
		</Form>
	);
}
