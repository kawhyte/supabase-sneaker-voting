import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";
import { CirclePlus } from "lucide-react";

export default async function AuthButton() {
  let user = null;
  let users = null;

  try {
    const supabase = await createClient();
    if (supabase) {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser();
      user = authUser;

      if (user) {
        const { data: userData, error } = await supabase.from("user").select("role").single();
        users = userData;
      }
    }
  } catch (error) {
    console.error('Auth error:', error);
  }

  const signOut = async () => {
    "use server";

    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
      return redirect("/login");
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return user ? (
    <div className="flex items-end gap-x-6   font-semibold text-base px-3 leading-[1.2]  ">
      
      { users?.role ==="admin" ? <Link href="/sneakers/create">
      
      <CirclePlus className="mb-2"/> 
      {/* <Button variant={"ghost"} className="hover:border-gray-300 rounded-xl border-2  h-9" >
          Create New
        </Button> */}
   </Link> :"" }
      
      {/* Hey, {user.email?.slice(0,2)}! */}
     
      <Avatar>
      <AvatarImage src="" alt="@shadcn" />
      <AvatarFallback className="uppercase">{user.email?.slice(0,2)}</AvatarFallback>
    </Avatar>
      <form action={signOut}>
        <Button variant={"ghost"} className="hover:border-gray-300 rounded-xl border-2  h-9" >
          Logout
        </Button>
      </form>
   
						
    </div>
  ) : (
    <Link
      href="/login"
      className="  rounded-md no-underline bg-btn-background hover:bg-btn-background-hover font-semibold text-base      hover:text-green-500/80 items-center transition ease-in duration-200 px-3 opacity translate-y-[10px] group  leading-[1.2] "
    >
      <Button variant={'secondary'} className="hover:border-gray-300 rounded-xl border-2  h-9">

         Login
      </Button>
     
    </Link>
  );
}
