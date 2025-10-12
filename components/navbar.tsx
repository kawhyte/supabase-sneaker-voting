import AuthButton from "@/components/AuthButton";
import { NavbarClient } from "@/components/navbar-client";

export async function Navbar() {
	return <NavbarClient authButton={<AuthButton />} />;
}
