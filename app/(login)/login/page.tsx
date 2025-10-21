import { login } from "./actions";
import { LoginForm } from "@/components/auth/login-form";

export default async function Login({
	searchParams,
}: {
	searchParams: Promise<{ message: string }>;
}) {
	const params = await searchParams;

	return (
		<div className="min-h-screen w-full flex items-center justify-center px-4 py-12">
			<div className="w-full max-w-4xl">
				<LoginForm formAction={login} searchParams={params} />
			</div>
		</div>
	);
}
