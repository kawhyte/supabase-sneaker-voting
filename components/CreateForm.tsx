"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { createClient } from "@/utils/supabase/client";
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
import { ToastAction } from "@radix-ui/react-toast";
import Link from "next/link";

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
		message: "SKU must be at least 2 characters.",
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
				image_link: z.string().url({ message: "Please enter a valid URL." } , ),
      sneaker_id:z.string(), main_image:z.boolean()})
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
});

const  CreateForm = () => {

  const [name, setName] = useState("");
	const [date, setDate] = useState("");
	const [brand, setBrand] = useState("2");
	const [price, setPrice] = useState("");
	const [style, setStyle] = useState("");
	const [formError, setFormError] = useState("");
	const [main_image, setImage] = useState("");


	// 1. Defining the form.
	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			sneakerName: "",
			sneakerSKU: "",
			sneakerPrice: 0,
			sneakerBrand: "2",
			mainSneakerImageLink: "",
			sneakerImageLink: [],
		},
	});

	const { fields, append, remove } = useFieldArray({
		name: "sneakerImageLink",
		control: form.control,
	});
	// 2. Define a submit handler.
async	function  onSubmit(values: z.infer<typeof formSchema>) {

  console.log("Before",values);
		// Do something with the form values.
		// ✅ This will be type-safe and validated.
    const supabase = createClient();
    
    // const {
		// 	data: { user },
		// } = await supabase.auth.getUser();

		// if (!values.sneakerName || !values.sneakerReleaseDate || !values.sneakerBrand || !values.sneakerPrice || !values.sneakerSKU || !values.mainSneakerImageLink) {
		// 	setFormError("Please fill in all the fields correctly.");

		// 	return;
		// }

    

    const { data: sneaker_data, error } = await supabase
			.from("sneakers")
			.insert([
				{
					name: values.sneakerName,
					brand_id: parseInt(values.sneakerBrand,10) ,// parseInt(brand, 10),
					release_date: values.sneakerReleaseDate,
					price: values.sneakerPrice,
					style: values.sneakerSKU,
					main_image: values.mainSneakerImageLink,
				},
			])
			.select();
		if (error) {
			console.log(error);
			setFormError(error.message);
		}

    console.log("here")

    if (sneaker_data) {
			const sneakerID = sneaker_data[0]?.id;
			console.log("sneaker_data", sneakerID);

      values?.sneakerImageLink?.push({image_link:values.mainSneakerImageLink, sneaker_id:"",main_image:true })
			values?.sneakerImageLink?.map((a) => (a.sneaker_id = sneakerID));
			// const { data, error } = await supabase
			// 	.from("images")
			// 	.insert([
			// 		{ sneaker_id: sneakerID, image_link: main_image, main_image: true },
			// 	])
			// 	.select();
			const { data, error } = await supabase
				.from("images")
				.insert(values?.sneakerImageLink)
				.select();

			if (error) {
				console.log("sneakerID ERROR", error);
				setFormError(error.message);
			}

			console.log("sneakerID data ", data);
			//setFormError("");

			//router.push("/sneakers/dashboard/pending");


		toast({
			title: `${values.sneakerName} was successfully added 🚀`,
			action: (
				<ToastAction altText='Try again'>
					<Link href={"/sneakers/dashboard/pending"} className='font-sm'>
						View Listing{" "}
					</Link>
				</ToastAction>
			),
		});
		console.log("After",values);
		}



	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className='space-y-8'>
				<div className='mb-6'>
					<img
						src={
							main_image === ""
								? "https://placehold.co/688x412?text=Main+Sneaker+Image"
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
							<FormLabel className="uppercase">Sneaker Name</FormLabel>
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

				<div className='flex flex-col md:flex-row  gap-y-8 md:gap-y-0 justify-between'>
					<FormField
						control={form.control}
						name='sneakerSKU'
						render={({ field }) => (
							<FormItem>
								<FormLabel className="uppercase">Sneaker SKU/STYLE</FormLabel>
								<FormControl>
									<Input
										className={cn("w-[230px] pl-3 text-left font-normal")}
										placeholder='AQ9129 500 '
										{...field}
									/>
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
								<FormLabel className="uppercase">Retail Price</FormLabel>
								<FormControl>
									<Input
										className={cn("w-[320px] pl-3 text-left font-normal")}
										placeholder='210'
										{...field}
									/>
								</FormControl>
								{/* <FormDescription>
                The display name of the Sneaker.
              </FormDescription> */}
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div className='flex flex-col md:flex-row  gap-y-8 md:gap-y-0 justify-between'>
					<FormField
						control={form.control}
						name='sneakerBrand'
						render={({ field }) => (
							<FormItem className='flex flex-col'>
								<FormLabel className="uppercase">Sneaker Brand</FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant='outline'
												role='combobox'
												className={cn(
													"w-[230px] justify-between",
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
								<FormLabel className="uppercase">Release Date </FormLabel>
								<Popover>
									<PopoverTrigger asChild>
										<FormControl>
											<Button
												variant={"outline"}
												className={cn(
													"w-[320px] pl-3 text-left font-normal",
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
								{/* <FormDescription>
                Your date of birth is used to calculate your age.
              </FormDescription> */}
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>

				<div>
					<FormField
						control={form.control}
						name='mainSneakerImageLink'
						render={({ field }) => (
							<>
								<FormItem>
									<FormLabel className="uppercase">Main Image URL</FormLabel>
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
							name={`sneakerImageLink.${index}.image_link`}
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
						variant="secondary"
						size='sm'
						className='mt-2'
						onClick={() => append({ image_link: "", sneaker_id:"", main_image:false })}>
						Add more Sneaker URLs
					</Button>
				</div>
				<Button type='submit'>Submit</Button>
			</form>
		</Form>
	);
}

export default CreateForm