import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SubmitButton } from "../login/submit-button";

const signUp = async (formData: FormData) => {
	"use server";

	const origin = headers().get("origin");
	const email = formData.get("email") as string;
	const password = formData.get("password") as string;
	const supabase = createClient();

	const { error } = await supabase.auth.signUp({
		email,
		password,
		options: {
			emailRedirectTo: `${origin}/auth/callback`,
		},
	});

	if (error) {
		return redirect("/login?message=Could not authenticate user");
	}

	return redirect("/login?message=Check email to continue sign in process");
};

export default function LoginForm() {
	return (
		<Card className='mx-auto mt-20 max-w-sm'>
			<CardHeader>
				<CardTitle className='text-xl'>Sign Up</CardTitle>
				<CardDescription>
					Enter your information to create an account
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form className='animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground'>
					<div className='grid gap-4'>
						<div className='grid grid-cols-2 gap-4'>
							<div className='grid gap-2'>
								<Label htmlFor='first-name'>First name</Label>
								<Input id='first-name' placeholder='Max' required />
							</div>
							<div className='grid gap-2'>
								<Label htmlFor='last-name'>Last name</Label>
								<Input id='last-name' placeholder='Robinson' required />
							</div>
						</div>
						<div className='grid gap-2'>
							<Label htmlFor='email'>Email</Label>
							<Input
								id='email'
								type='email'
								name='email'
								placeholder='m@example.com'
								required
							/>
						</div>
						<div className='grid gap-2'>
							<Label htmlFor='password'>Password</Label>
							<Input
								id='password'
								type='password'
								name='password'
								placeholder='••••••••'
								required
							/>
						</div>
						{/* <Button type='submit' className='w-full'>
							Create an account-- nah
						</Button> */}

						<SubmitButton
							formAction={signUp}
							className='bg-gray-200 hover:bg-gray-200/90 text-black  text-sm  rounded-md px-4 py-2 w-full text-foreground mb-2'
							pendingText='Signing Up...'>
							Create an account
						</SubmitButton>
						{/* <Button variant='outline' className='w-full'>
							Sign up with GitHub
						</Button> */}
					</div>
				</form>
				<div className='mt-4 text-center text-sm'>
					Already have an account?{" "}
					<Link href='/login' className='underline'>
						Log in
					</Link>
				</div>
			</CardContent>
		</Card>
	);
}
