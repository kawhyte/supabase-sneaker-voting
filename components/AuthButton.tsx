import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function AuthButton() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const signOut = async () => {
    "use server";

    const supabase = createClient();
    await supabase.auth.signOut();
    return redirect("/login");
  };

  return user ? (
    <div className="flex items-end gap-4  font-mono py-2 px-3 leading-[1.2] text-xs md:text-sm ">
      Hey, {user.email}!
      <form action={signOut}>
        <button className="rounded-md no-underline bg-btn-background hover:bg-btn-background-hover hidden md:block hover:text-green-500/80 items-center transition ease-in duration-200 py-2 px-3 opacity translate-y-[10px] group font-mono leading-[1.2] text-xs md:text-sm">
          Logout
        </button>
      </form>
    </div>
  ) : (
    <Link
      href="/login"
      className=" flex rounded-md no-underline bg-btn-background hover:bg-btn-background-hover      hover:text-green-500/80 items-center transition ease-in duration-200 py-2 px-3 opacity translate-y-[10px] group font-mono leading-[1.2] text-xs md:text-sm"
    >
      Login
    </Link>
  );
}
