"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/router";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { createClient } from "@/utils/supabase/client";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import {
	Check,
	ChevronsUpDown,
	CalendarIcon,
	Smile,
	ThumbsUp,
	Meh,
	ThumbsDown,
} from "lucide-react";
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
import { ToastAction } from "@radix-ui/react-toast";
import Link from "next/link";

import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "./ui/carousel";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import Image from "next/image";
import { Badge } from "./ui/badge";

const brands = [
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

const ratings = [
	{ label: "Love it ", value: "1", icon: ThumbsUp, color: "green" },
	{ label: "I like it ", value: "4", icon: Smile, color: "blue" },
	{ label: "Meh ", value: "2", icon: Meh, color: "yellow" },
	{ label: "Not for me ", value: "3", icon: ThumbsDown, color: "red" },
] as const;

const formSchema = z.object({
	name: z.string().min(2, {
		message: "Sneaker name must be at least 2 characters.",
	}),

	// collection_image: z.union([z.string().url().nullish(), z.literal("")]),
	collection_image: z
		.union([z.literal(""), z.string().url().trim().url()])
		.optional(),

	SKU: z.string().min(2, {
		message: "SKU must be at least 2 characters.",
	}),
	brand: z.string({
		required_error: "Please select a sneaker brand.",
	}),

	rating: z
		.string({
			required_error: "Please select a sneaker brand.",
		})
		.optional()
		.or(z.literal("")),
	// sneakerImageLink: z.string().url({
	// 	message: "Sneaker link is required.",
	// }),
	//imageId: z.number(),
	images: z
		.array(
			z.object({
				image_link: z.string().url({ message: "Please enter a valid URL." }),
				sneaker_id: z.number(),
				main_image: z.boolean(),
				//id: z.number(),
			})
		)
		.optional(),

	release_date: z.date({
		required_error: "A sneaker release date is required.",
	}),

	retailPrice: z
		.union([
			z.string().transform((x) => x.replace(/[^0-9.-]+/g, "")),
			z.number(),
		])
		.pipe(z.coerce.number().min(0.0001).max(999999999)),
});

const CreateEditForm = ({
	sneaker,
	main,
	id,
	all_images,
}: {
	sneaker: any;
	main: any;
	id: number;
	all_images: any;
}) => {
	const [formError, setFormError] = useState("");
	const [data, setData] = useState("");

	//console.log("Snealers ", sneaker);

	//Defining the form.
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),

		defaultValues: {
			name: "",
			SKU: "",
			retailPrice: 0,
			brand: "",
			rating: "",
			// collection_image: "https://res.cloudinary.com/babyhulk/image/upload/a_vflip.180/co_rgb:e7e7e7,e_colorize:100/v1710621770/sneakers/baseball.png",
			collection_image: "",

			images: [
				{
					image_link: "",
					main_image: true,
					sneaker_id: 0,
					//id: 0,
				},
			],
		},

		values: sneaker
			? {
					name: sneaker.name,
					SKU: sneaker.style,
					retailPrice: sneaker.price,
					brand: sneaker?.brand_id?.id?.toString(),
					rating: sneaker?.rating_id?.vote?.vote_id?.toString(),
					collection_image: sneaker.collection_image || "", //sneaker.images[0].image_link,
					release_date: new Date(sneaker.release_date),
					images: sneaker.images,
			  }
			: undefined,
	});

	const { fields, append, remove } = useFieldArray({
		name: "images",
		control: form.control,
	});

	// Submit handler.
	async function onSubmit(values: z.infer<typeof formSchema>) {
		// Do something with the form values.
		// ✅ This will be type-safe and validated.

		const supabase = createClient();

		// Check if there us exsisting sneaker to be updated.
		// If no sneaker is available, then create a new listing
		if (sneaker) {
			//console.log("I am EDIT - sneaker");
			//console.log("Brand ", values.brand);
			const { data: sneaker_data, error } = await supabase
				.from("sneakers")
				.update({
					name: values.name,
					brand_id: values.brand,
					release_date: values.release_date,
					price: values.retailPrice,
					style: values.SKU,
					//main_image: values.main_image,
				})
				.eq("id", id)
				.select();

			if (error) {
				console.log(error);

				toast({
					description: "Please fill in all the fields correctly.",
				});
				setFormError("Please fill in all the fields correctly.");
			}

			if (sneaker_data) {
				const sneakerID = sneaker_data[0]?.id;

				const { data: sneaker_image_data, error: sneaker_image_error } =
					await supabase.from("images").delete().eq("sneaker_id", id).select();

				if (sneaker_image_data) {
					values?.images?.map((a) => (a.sneaker_id = sneakerID));

					const { data, error } = await supabase
						.from("images")
						.upsert(values?.images, { onConflict: "id" })
						.select();
					if (error) {
						console.log("sneakerID ERROR", error);
						//setFormError(error.message);
					}
				}

				const { data: newVote, error: VoteError } = await supabase
					.from("rating")
					.update({ vote: values?.rating })
					.eq("sneaker_id", sneakerID)
					.select();

				toast({
					title: `${values.name} was successfully updated 🚀`,
				});

				//router.push("/sneakers/dashboard/pending");
			}
		} else {
			const { data: sneaker_data, error } = await supabase
				.from("sneakers")
				.insert([
					{
						name: values.name,
						brand_id: parseInt(values.brand, 10),
						release_date: values.release_date,
						price: values.retailPrice,
						style: values.SKU,
						//main_image: values.main_image,
					},
				])
				.select();
			if (error) {
				console.log(error);
				setFormError(error.message);
			}

			if (sneaker_data) {
				const sneakerID = sneaker_data[0]?.id;
				//console.log("sneaker_data", sneakerID);

				values?.images?.map((a) => (a.sneaker_id = sneakerID));

				const { data, error } = await supabase
					.from("images")
					.insert(values?.images)
					.select();

				if (error) {
					setFormError(error.message);
				}

				toast({
					title: `${values.name} was successfully added 🚀`,
					action: (
						<ToastAction altText='Try again'>
							<Link href={"/sneakers/dashboard/pending"} className='font-sm'>
								View Listing{" "}
							</Link>
						</ToastAction>
					),
				});
			}
		}
	}
	const onInvalid = (errors: any) => console.error(errors);

	return (
		<>
			<div className=''>
				<Form {...form}>
					<form
						noValidate
						onSubmit={form.handleSubmit(onSubmit, onInvalid)}
						className=' flex flex-col justify-start items-start space-y-10   '>
						<div className='my-10  '>
							<>
								{sneaker?.images ? (
									<Carousel className=' bg-white w-[408px] md:w-[708px]'>
										<CarouselContent className=' '>
											{sneaker?.images
												.sort((a: any, b: any) => b.main_image - a.main_image)
												?.map((item: any, index: any) => {
													return (
														<CarouselItem key={item.id}>
															<div className=' w-[358px] h-[212px] md:w-[698px] md:h-[412px] '>
																<AspectRatio ratio={16 / 10}>
																	<Image
																		src={item.image_link}
																		alt='Image'
																		fill
																		className='rounded-md object-cover'
																		blurDataURL='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAADCAYAAAC09K7GAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAO0lEQVR4nGNgYGBg+P//P1t9fT0TiM0we3ZjxZxZjQ9XLpwwe9nCHkOGGZOyanraY9aumN2wbsn0hmQA/MEWfj4ocjcAAAAASUVORK5CYII='
																		placeholder='blur'
																		quality={30}
																	/>
																</AspectRatio>
															</div>
														</CarouselItem>
													);
												})}
										</CarouselContent>
										<div className='bg-red-300 flex flex-col absolute bottom-5 right-20 '>
											{sneaker.images.length > 1 && (
												<CarouselPrevious type='button' className='    ' />
											)}
											{sneaker.images.length > 1 && (
												<CarouselNext type='button' className='   ' />
											)}
										</div>
									</Carousel>
								) : (
									<></>
								)}
							</>
						</div>

						<FormField
							control={form.control}
							name='name'
							render={({ field }) => (
								<FormItem>
									<FormLabel className='uppercase'>Sneaker Name</FormLabel>
									<FormControl>
										<Input
											className={cn(
												"w-[405px] md:w-[705px]  text-left font-normal"
											)}
											placeholder='Air Jordan 1 '
											{...field}
										/>
									</FormControl>

									<FormMessage />
								</FormItem>
							)}
						/>

						<div className=' grid md:grid-cols-3 gap-6 items-center md:place-items-start pl'>
							<FormField
								control={form.control}
								name='SKU'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='uppercase'>
											Sneaker SKU/STYLE
										</FormLabel>
										<FormControl>
											<Input
												className={cn(
													"w-[200px]   md:w-[200px]  text-left font-normal"
												)}
												placeholder='AQ9129 500 '
												{...field}
											/>
										</FormControl>

										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='retailPrice'
								render={({ field }) => (
									<FormItem>
										<FormLabel className='uppercase'>Retail Price</FormLabel>
										<FormControl>
											<Input
												className={cn("w-[170px] pl-3 text-left font-normal")}
												placeholder='210'
												{...field}
											/>
										</FormControl>

										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='release_date'
								render={({ field }) => (
									<FormItem className='flex flex-col '>
										<FormLabel className='uppercase'>Release Date </FormLabel>
										<Popover>
											<PopoverTrigger asChild>
												<FormControl>
													<Button
														variant={"outline"}
														className={cn(
															" w-[200px] md:w-[220px]  text-left font-normal",
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
													// disabled={(date) =>
													// 	date > new Date() || date < new Date("1900-01-01")
													// }
													initialFocus
												/>
											</PopoverContent>
										</Popover>

										<FormMessage />
									</FormItem>
								)}
							/>

							<FormField
								control={form.control}
								name='brand'
								render={({ field }) => (
									<FormItem className='flex flex-col'>
										<FormLabel className='uppercase'>Sneaker Brand</FormLabel>
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
															? brands.find(
																	(brand) => brand.value === field.value
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
															{brands.map((brand) => (
																<CommandItem
																	value={brand.label}
																	key={brand.value}
																	onSelect={() => {
																		form.setValue("brand", brand.value);
																	}}>
																	<Check
																		className={cn(
																			"mr-2 h-4 w-4",
																			brand.value === field.value
																				? "opacity-100"
																				: "opacity-0"
																		)}
																	/>
																	{brand.label}
																</CommandItem>
															))}
														</CommandList>
													</CommandGroup>
												</Command>
											</PopoverContent>
										</Popover>

										<FormMessage />
									</FormItem>
								)}
							/>

							{sneaker?.rating_id.vote.vote_id && (
								<FormField
									control={form.control}
									name='rating'
									render={({ field }) => (
										<FormItem className='flex flex-col'>
											<FormLabel className='uppercase'>
												Sneaker Rating
											</FormLabel>
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
																? ratings.find(
																		(rating) => rating.value === field.value
																  )?.label
																: "Select Rating"}

															<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
														</Button>
													</FormControl>
												</PopoverTrigger>
												<PopoverContent className='w-[200px] p-0'>
													<Command>
														<CommandInput placeholder='Search rating...' />
														<CommandEmpty>No vote.</CommandEmpty>
														<CommandGroup>
															<CommandList>
																{ratings.map((rating) => (
																	<CommandItem
																		value={rating.label}
																		key={rating.value}
																		onSelect={() => {
																			form.setValue("rating", rating.value);
																		}}>
																		<Check
																			className={cn(
																				"mr-2 h-4 w-4",
																				rating.value === field.value
																					? "opacity-100"
																					: "opacity-0"
																			)}
																		/>

																		<div className='flex items-center gap-x-2'>
																			{rating.label}
																			<rating.icon
																				color={rating.color}
																				className='mr-2 h-4 w-4 '
																			/>
																		</div>
																	</CommandItem>
																))}
															</CommandList>
														</CommandGroup>
													</Command>
												</PopoverContent>
											</Popover>

											<FormMessage />
										</FormItem>
									)}
								/>
							)}
						</div>

						<div>
							<FormField
								control={form.control}
								name='collection_image'
								render={({ field }) => (
									<>
										<FormItem>
											<FormLabel className='uppercase'>
												Collection Image URL
											</FormLabel>
											{/* onBlur={() => setImage(field.value)} */}
											<FormControl>
												<Input
													className='w-[650px]'
													placeholder='https:// '
													{...field}
												/>
											</FormControl>

											<FormMessage />
										</FormItem>
									</>
								)}
							/>
							{fields.map((field, index) => (
								<FormField
									control={form.control}
									key={field.id}
									name={`images.${index}.image_link`}
									render={({ field }) => (
										<>
											<FormItem>
												{/* <FormLabel className={cn(index !== 0 && "sr-only")}>
										Additional URLs
									</FormLabel> */}

												<FormDescription
													className={cn(index !== 0 && "sr-only")}>
													Sneaker Image Link(s).
												</FormDescription>
												{/* <FormControl onChange={() => handleImageUpdate(field.value)} > */}
												<FormControl>
													<div className='flex justify-between items-center'>
														<Input
															{...field}
															className='w-[320px] md:w-[650px]  '
														/>
														{index > 0 ? (
															<Button
																type='button'
																variant='outline'
																size='sm'
																className='ml-2'
																onClick={() => remove(index)}>
																Remove row
															</Button>
														) : (
															""
														)}
													</div>
												</FormControl>
												<FormMessage />
											</FormItem>
										</>
									)}
								/>
							))}
							<Button
								type='button'
								variant='secondary'
								size='sm'
								className='mt-2'
								onClick={() =>
									append({
										image_link: "",
										sneaker_id: 0,
										//id: 0,
										main_image: false,
									})
								}>
								Add more Sneaker URLs
							</Button>
						</div>
						<Button type='submit'>Submit</Button>
					</form>
				</Form>
			</div>
		</>
	);
};

export default CreateEditForm;
