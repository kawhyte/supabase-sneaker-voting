

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function SkeletonCard() {
  return (
    <> 
<section className='text-gray-600 body-font flex flex-col justify-center items-center align-middle'>
				<div className='container mx-auto flex px-5 md:pt-10 items-center justify-center flex-col'>
				
					<div className='text-center w-full flex flex-col justify-center align-middle items-center'>
						<div className='font-serif flex text-white flex-col -skew-y-3 drop-shadow-xl mt-10  text-[4.25rem] sm:text-[5.5rem] tracking-[-0.03em] leading-[0.88] font-bold'>
					
						</div>

					</div>
				</div>
			</section>

    <Card className="flex flex-col justify-between">
      <CardHeader className="flex-row gap-4 items-center">
        <Skeleton className="w-12 h-12 rounded-full" />
        <Skeleton className="h-6 flex-grow" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-4 flex-grow mt-4" />
        <Skeleton className="h-4 flex-grow mt-4" />
        <Skeleton className="h-4 w-1/2 mt-4" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-10 w-28" />
      </CardFooter>
    </Card>
    </>
  )
}