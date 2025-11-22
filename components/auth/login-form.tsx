'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { SubmitButton } from "@/app/(login)/login/submit-button"
import { ArrowLeft } from 'lucide-react'
import Link from "next/link"

// Dynamically import Lottie (copied from HomePage for consistency)
const Lottie = dynamic(() => import('react-lottie-player'), {
  ssr: false,
})

function LottieAnimationWrapper() {
  const [animationData, setAnimationData] = useState(null)

  useEffect(() => {
    fetch('/animations/cat-wardrobe.json') // Make sure this path matches your public folder
      .then(res => res.json())
      .then(setAnimationData)
      .catch(err => console.error('Failed to load Lottie:', err))
  }, [])

  if (!animationData) return <div className="w-full h-64 bg-stone-100 rounded-full animate-pulse" />

  return (
    <div className="w-full max-w-[320px] aspect-square relative z-10">
      {/* Soft Glow behind the cat */}
      <div className="absolute inset-0 bg-sun-200/40 blur-[60px] rounded-full transform scale-75" />
      <Lottie
        loop
        play
        animationData={animationData}
        style={{ width: '100%', height: '100%' }}
        rendererSettings={{ preserveAspectRatio: 'xMidYMid slice' }}
      />
    </div>
  )
}

interface LoginFormProps extends React.ComponentProps<"div"> {
  formAction: (formData: FormData) => Promise<void>
  searchParams?: { message?: string }
}

export function LoginForm({
  className,
  formAction,
  searchParams,
  ...props
}: LoginFormProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {/* Back Link - kept simple and clean */}
      <div className="flex justify-center md:justify-start">
        <Link href="/" className="group flex items-center text-sm font-semibold text-slate-500 hover:text-slate-900 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Back to Wardrobe
        </Link>
      </div>

      {/* Main Card - Rounded like the Bento Grid */}
      <Card className="overflow-hidden p-0 rounded-[2rem] border-stone-200 shadow-xl bg-white">
        <CardContent className="grid p-0 md:grid-cols-2 min-h-[600px]">
          
          {/* LEFT SIDE: Form Section */}
          <form action={formAction} className="p-8 md:p-12 flex flex-col justify-center">
            <FieldGroup className="space-y-6">
              {/* Header */}
              <div className="flex flex-col gap-2 mb-4">
                <div className="flex items-center gap-2 mb-2">
                   <span className="px-3 py-1 rounded-full bg-sun-100 text-sun-700 text-xs font-bold uppercase tracking-wider">
                     Member Access
                   </span>
                </div>
                {/* Updated Typography to match Homepage */}
                <h1 className="text-3xl md:text-4xl font-extrabold text-slate-950 tracking-tight">
                  Welcome back.
                </h1>
                <p className="text-slate-500 text-lg font-medium">
                  Your wardrobe is waiting.
                </p>
              </div>

              {/* Email Field */}
              <Field>
                <FieldLabel htmlFor="email" className="text-slate-900 font-bold">Email</FieldLabel>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="name@example.com"
                  required
                  suppressHydrationWarning
                  className="h-12 rounded-xl border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-sun-400 focus:border-sun-400 transition-all font-medium"
                />
              </Field>

              {/* Password Field */}
              <Field>
                <div className="flex items-center justify-between mb-1.5">
                  <FieldLabel htmlFor="password" className="text-slate-900 font-bold">Password</FieldLabel>
                  <Link
                    href="/forgot-password"
                    className="text-sm font-semibold text-slate-400 hover:text-sun-600 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  suppressHydrationWarning
                  className="h-12 rounded-xl border-stone-200 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-sun-400 focus:border-sun-400 transition-all font-medium"
                />
              </Field>

              {/* Submit Button */}
              <Field className="pt-2">
                <SubmitButton
                  className="w-full h-12 bg-sun-400 hover:bg-sun-500 hover:scale-[1.02] active:scale-[0.98] text-slate-950 font-bold text-lg rounded-full transition-all shadow-sm"
                  pendingText="Unlocking...">
                  Login
                </SubmitButton>
              </Field>

              {/* OAuth Separator */}
              <FieldSeparator className="my-4 text-slate-400 font-bold text-xs uppercase tracking-wider">
                Or continue with
              </FieldSeparator>

              {/* OAuth Buttons - Styled to match */}
              <Field className="grid grid-cols-3 gap-3">
                <Button variant="outline" type="button" className="h-12 rounded-xl border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-all">
                   {/* Apple Icon */}
                   <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701"/></svg>
                </Button>
                <Button variant="outline" type="button" className="h-12 rounded-xl border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-all">
                   {/* Google Icon */}
                   <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"/></svg>
                </Button>
                <Button variant="outline" type="button" className="h-12 rounded-xl border-stone-200 hover:bg-stone-50 hover:border-stone-300 transition-all">
                   {/* Meta Icon */}
                   <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6.915 4.03c-1.968 0-3.683 1.28-4.871 3.113C.704 9.208 0 11.883 0 14.449c0 .706.07 1.369.21 1.973a6.624 6.624 0 0 0 .265.86 5.297 5.297 0 0 0 .371.761c.696 1.159 1.818 1.927 3.593 1.927 1.497 0 2.633-.671 3.965-2.444.76-1.012 1.144-1.626 2.663-4.32l.756-1.339.186-.325c.061.1.121.196.183.3l2.152 3.595c.724 1.21 1.665 2.556 2.47 3.314 1.046.987 1.992 1.22 3.06 1.22 1.075 0 1.876-.355 2.455-.843a3.743 3.743 0 0 0 .81-.973c.542-.939.861-2.127.861-3.745 0-2.72-.681-5.357-2.084-7.45-1.282-1.912-2.957-2.93-4.716-2.93-1.047 0-2.088.467-3.053 1.308-.652.57-1.257 1.29-1.82 2.05-.69-.875-1.335-1.547-1.958-2.056-1.182-.966-2.315-1.303-3.454-1.303zm10.16 2.053c1.147 0 2.188.758 2.992 1.999 1.132 1.748 1.647 4.195 1.647 6.4 0 1.548-.368 2.9-1.839 2.9-.58 0-1.027-.23-1.664-1.004-.496-.601-1.343-1.878-2.832-4.358l-.617-1.028a44.908 44.908 0 0 0-1.255-1.98c.07-.109.141-.224.211-.327 1.12-1.667 2.118-2.602 3.358-2.602zm-10.201.553c1.265 0 2.058.791 2.675 1.446.307.327.737.871 1.234 1.579l-1.02 1.566c-.757 1.163-1.882 3.017-2.837 4.338-1.191 1.649-1.81 1.817-2.486 1.817-.524 0-1.038-.237-1.383-.794-.263-.426-.464-1.13-.464-2.046 0-2.221.63-4.535 1.66-6.088.454-.687.964-1.226 1.533-1.533a2.264 2.264 0 0 1 1.088-.285z"/></svg>
                </Button>
              </Field>

              {/* Sign Up Link */}
              <FieldDescription className="text-center text-slate-500 font-medium">
                Don&apos;t have an account?{" "}
                <a href="/signup" className="font-bold text-slate-900 hover:text-sun-600 underline-offset-4 hover:underline transition-colors">
                  Sign up
                </a>
              </FieldDescription>

              {/* Error Message */}
              {searchParams?.message && (
                <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-center animate-in slide-in-from-top-2">
                  <p className="text-sm font-bold text-red-600">{searchParams.message}</p>
                </div>
              )}
            </FieldGroup>
          </form>

          {/* RIGHT SIDE: The Visual Narrative (Replaces Static Image) */}
          <div className="hidden md:flex relative bg-stone-100 items-center justify-center p-12">
            {/* Background Pattern or Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/50 to-stone-100/0" />
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
               <LottieAnimationWrapper />
               <div className="space-y-2 max-w-[280px]">
                 <h3 className="text-xl font-bold text-slate-900">Your Personal Stylist</h3>
                 <p className="text-sm text-slate-500 leading-relaxed">
                   Track wears, monitor prices, and curate your rotation with ease.
                 </p>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}