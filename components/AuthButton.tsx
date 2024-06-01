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
    <div className="flex items-end gap-x-6   font-semibold text-base py-2 px-3 leading-[1.2]  ">
      Hey, {user.email}!
      <form action={signOut}>
        <button className="rounded-md no-underline bg-btn-background hover:bg-btn-background-hover hidden md:block hover:text-green-500/80 items-center transition ease-in duration-200 py-2 px-3 opacity translate-y-[10px] group  leading-[1.2] ">
          Logout
        </button>
      </form>
    </div>
  ) : (
    <Link
      href="/login"
      className=" flex rounded-md no-underline bg-btn-background hover:bg-btn-background-hover font-semibold text-base      hover:text-green-500/80 items-center transition ease-in duration-200 py-2 px-3 opacity translate-y-[10px] group  leading-[1.2] "
    >
      Login
    </Link>
  );
}
