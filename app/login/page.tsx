
import { headers } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { SubmitButton } from "./submit-button";

export default function Login({
	searchParams,
}: {
	searchParams: { message: string };
}) {
	const signIn = async (formData: FormData) => {
		"use server";

		const email = formData.get("email") as string;
		const password = formData.get("password") as string;
		const supabase = createClient();

		const { error } = await supabase.auth.signInWithPassword({
			email,
			password,
		});

		if (error) {
			return redirect("/login?message=Could not authenticate user");
		}

		return redirect("/sneakers");
	};

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

	return (
		<>
			<div className='py-16  w-full bg-red-200 '>
				<div className='flex bg-white rounded-lg shadow-lg overflow-hidden mx-auto max-w-sm lg:max-w-6xl'>
					<div
						className='hidden lg:block lg:w-1/2 bg-cover'
						style={{
							backgroundImage:
								"url(" +
								"https://images.unsplash.com/photo-1586525198428-225f6f12cff5?q=80" +
								")",
							backgroundPosition: "center",
							backgroundSize: "cover",
							backgroundRepeat: "no-repeat",
						}}></div>
					<div className='w-full p-8 lg:w-1/2'>
						<p className='text-base text-gray-600 text-center font-mono mb-6'>
							Welcome back to
						</p>
						<h2 className='font-serif mb-3 flex text-gray-800 flex-col -skew-y-3 drop-shadow-xl   text-[3.25rem] sm:text-[2.5rem] tracking-[-0.03em] leading-[0.88] font-bold'>
							MTW's Sneaker Collection
						</h2>

						<div className='mt-4 flex items-center justify-between'>
							<span className='border-b w-1/5 lg:w-1/4'></span>

							<span className='border-b w-1/5 lg:w-1/4'></span>
						</div>
						<form className='animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground'>
							<div className='mt-4'>
								<label className='block text-gray-700 text-sm font-bold mb-2'>
									Email Address
								</label>
								<input
									className='bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none'
									type='email'
									required
									name='email'
									placeholder='you@gmail.com'
								/>
							</div>
							<div className='mt-4'>
								<div className='flex justify-between'>
									<label className='block text-gray-700 text-sm font-bold mb-2'>
										Password
									</label>
								</div>
								<input
									className='bg-gray-200 text-gray-700 focus:outline-none focus:shadow-outline border border-gray-300 rounded py-2 px-4 block w-full appearance-none'
									type='password'
									required
									name='password'
									placeholder='••••••••'
								/>
							</div>
							<div className='mt-8'>
								<SubmitButton
									formAction={signIn}
									className='bg-green-700 rounded-md px-4 py-2 w-full text-foreground mb-2'
									pendingText='Signing In...'>
									Sign In
								</SubmitButton>
							</div>

							<div className='mt-4 flex items-center justify-between'>
								<span className='border-b w-1/5 md:w-1/4'></span>

								<SubmitButton
									formAction={signUp}
									className=' rounded-md px-4 py-2 text-foreground mb-2 text-xs text-gray-500 uppercase'
									pendingText='Signing Up...'>
									or Sign Up
								</SubmitButton>

								{searchParams?.message && (
									<p className='mt-4 p-4 bg-foreground/10 text-foreground text-center'>
										{searchParams.message}
									</p>
								)}

								<span className='border-b w-1/5 md:w-1/4'></span>
							</div>
						</form>
					</div>
				</div>
			</div>

			{/* <div className='flex-1 flex flex-col w-full px-8  justify-center gap-2'>
				<Link
					href='/'
					className='absolute left-8 top-8 py-2 px-4 rounded-md no-underline text-foreground bg-btn-background hover:bg-btn-background-hover flex items-center group text-sm'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						width='24'
						height='24'
						viewBox='0 0 24 24'
						fill='none'
						stroke='currentColor'
						strokeWidth='2'
						strokeLinecap='round'
						strokeLinejoin='round'
						className='mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1'>
						<polyline points='15 18 9 12 15 6' />
					</svg>{" "}
					Back
				</Link>
      
<div>
				<form className='animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground'>
					<label className='text-md' htmlFor='email'>
						Email
					</label>
					<input
						className='rounded-md px-4 py-2 bg-inherit border mb-6'
						name='email'
						placeholder='you@example.com'
						required
					/>
					<label className='text-md' htmlFor='password'>
						Password
					</label>
					<input
						className='rounded-md px-4 py-2 bg-inherit border mb-6'
						type='password'
						name='password'
						placeholder='••••••••'
						required
					/>
					<SubmitButton
						formAction={signIn}
						className='bg-green-700 rounded-md px-4 py-2 text-foreground mb-2'
						pendingText='Signing In...'>
						Sign In
					</SubmitButton>
					<SubmitButton
						formAction={signUp}
						className='border border-foreground/20 rounded-md px-4 py-2 text-foreground mb-2'
						pendingText='Signing Up...'>
						Sign Up
					</SubmitButton>
					{searchParams?.message && (
						<p className='mt-4 p-4 bg-foreground/10 text-foreground text-center'>
							{searchParams.message}
						</p>
					)}
				</form>
			</div>
      </div> */}
		</>
	);
}
