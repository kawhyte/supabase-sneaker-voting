import { SneakerTrackerApp } from "@/components/sneaker-tracker-app";
import  Link  from "next/link";

export default function Index() {
  return(
<> 
    <div className="flex  flex-row justify-between">
      
      <Link href="/" >Home Page</Link>
      <Link href='/dashboard' >DashBoard</Link>
      <Link  href ='/insights'>Insight</Link>
      
      
      </div>
  <div> Home Page</div></>
  // <SneakerTrackerApp />


)  ;
}
