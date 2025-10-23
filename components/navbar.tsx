import AuthButton from "@/components/auth-button";
import { NavbarClient } from "@/components/navbar-client";
import { createClient } from "@/utils/supabase/server";

export async function Navbar() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	return <NavbarClient authButton={<AuthButton />} isAuthenticated={!!user} />;
}
