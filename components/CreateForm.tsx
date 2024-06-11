"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { cn } from "@/lib/utils"

import { useForm } from "react-hook-form"
import { z } from "zod"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"


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
] as const






const formSchema = z.object({
  sneakerName: z.string().min(2, {
    message: "Sneaker Name must be at least 2 characters.",
  }),
  sneakerSKU: z.string().min(2, {
    message: "Sneaker SKU must be at least 2 characters.",
  }),
  sneakerBrand: z.string({
    required_error: "Please select a language.",
  }),


  sneakerPrice:z.union( [
    z.string().transform( x => x.replace( /[^0-9.-]+/g, '' ) ),
    z.number(),
  ] ).pipe( z.coerce.number().min( 0.0001 ).max( 999999999 ) ),


//   sneakerPrice: z.object({
//   type1: z.string(),
//   type2: z.string(),
//   type4: z.string().transform((val) => {
//     if (val.length !== 5) throw new Error('Type4 must have 5 digits')
//     return parseInt(val, 10)
//   }),
//   type5: z.number()
// }),



})

export function CreateForm() {
// 1. Define your form.
const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
        sneakerName: "",
        sneakerSKU: "",
        sneakerPrice: 0,
        //sneakerBrand:"1"
        //language:"",
    },
  })
 
  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="sneakerName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sneaker Name</FormLabel>
              <FormControl>
                <Input placeholder="Air Jordan 1 " {...field} />
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
          name="sneakerSKU"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sneaker SKU/STYLE</FormLabel>
              <FormControl>
                <Input placeholder="AQ9129 500 " {...field} />
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
          name="sneakerPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Retail Price</FormLabel>
              <FormControl>
                <Input placeholder="210 " {...field} />
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
          name="sneakerBrand"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Sneaker Brand</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant="outline"
                      role="combobox"
                      className={cn(
                        "w-[200px] justify-between",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value
                        ? languages.find(
                            (language) => language.value === field.value
                          )?.label
                        : "Select Brand"}
                      <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                  <Command>
                    <CommandInput placeholder="Search brand..." />
                    <CommandEmpty>No brand found.</CommandEmpty>
                    <CommandGroup>
                      <CommandList> 
                      {languages.map((language) => (
                        <CommandItem
                          value={language.label}
                          key={language.value}
                          onSelect={() => {
                            form.setValue("sneakerBrand", language.value)
                          }}
                        >
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


        
        <Button type="submit">Submit</Button>
      </form>
    </Form>
  )
}
