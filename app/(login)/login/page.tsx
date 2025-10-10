import { login } from "./actions";
import { SubmitButton } from "./submit-button";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default async function Login({
	searchParams,
}: {
	searchParams: Promise<{ message: string }>;
}) {
	const params = await searchParams;

	return (
		<>
			<div className='w-full lg:grid lg:min-h-[600px] lg:grid-cols-2 xl:min-h-[800px] max-w-7xl mt-10'>
				<div className='flex items-center justify-center py-12'>
					<div className='mx-auto grid w-[350px] gap-6'>
						<div className='grid gap-2 text-center'>
							<h1 className='text-3xl font-bold'>Login</h1>
							<p className='text-balance text-muted-foreground'>
								Enter your email below to login to your account
							</p>
						</div>
						<form action={login} className='animate-in flex-1 flex flex-col w-full justify-center gap-2 text-foreground'>
							<div className='grid gap-4'>
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
									<div className='flex items-center'>
										<Label htmlFor='password'>Password</Label>
										<Link
											href='/forgot-password'
											className='ml-auto inline-block text-sm underline'>
											Forgot your password?
										</Link>
									</div>
									<Input
										id='password'
										type='password'
										name='password'
										placeholder='••••••••'
										required
									/>
								</div>
								{/* <Button type='submit' className='w-full'>
									Login-nah
								</Button> */}
								<SubmitButton
									className='bg-green-500 hover:bg-green-500/90 text-black  text-sm  rounded-md px-4 py-2 w-full text-foreground mb-2'
									pendingText='Signing In...'>
									Login
								</SubmitButton>
								{/* <Button variant='outline' className='w-full'>
									Login with Google
								</Button> */}
							</div>
							<div className='mt-4 text-center text-sm'>
								Don&apos;t have an account?{" "}
								<Link href='/signup' className='underline'>
									Sign up
								</Link>
								{/* <SubmitButton
									formAction={signUp}
									className=' rounded-md px-4 py-2 text-foreground mb-2 text-xs text-gray-500 uppercase'
									pendingText='Signing Up...'>
									or Sign Up
								</SubmitButton> */}
								{params?.message && (
									<p className='mt-4 p-4 bg-yellow-100 border border-yellow-400 text-yellow-800 rounded-md text-center'>
										{params.message}
									</p>
								)}
							</div>
						</form>
					</div>
				</div>
				<div className='hidden bg-muted lg:block'>
					<Image
						src='https://images.unsplash.com/photo-1562424995-2efe650421dd?q=80&w=3687&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'
						alt='Image'
						width='1920'
						height='1080'
						className='h-full w-full object-cover dark:brightness-[0.2] dark:grayscale'
					/>
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
					{params?.message && (
						<p className='mt-4 p-4 bg-foreground/10 text-foreground text-center'>
							{params.message}
						</p>
					)}
				</form>
			</div>
      </div> */}
		</>
	);
}
