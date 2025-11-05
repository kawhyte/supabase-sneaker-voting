import AuthButton from '@/components/AuthButton';
import { NavbarClient } from '@/components/NavbarClient';
import { createClient } from "@/utils/supabase/server";

export async function Navbar() {
	const supabase = await createClient();
	const { data: { user } } = await supabase.auth.getUser();

	return <NavbarClient authButton={<AuthButton />} isAuthenticated={!!user} />;
}
