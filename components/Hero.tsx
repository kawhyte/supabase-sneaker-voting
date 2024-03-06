import NextLogo from "./NextLogo";
import SupabaseLogo from "./SupabaseLogo";
import ThumbsUpIcon from "./ThumbsUpIcon";

export default function Hero() {
	return (
  <> 
  <ThumbsUpIcon/>
		<div className='flex flex-col gap-4'> 
			      <p className="text-xl lg:text-2xl !leading-tight mx-auto max-w-xl text-center">
            Sneaker releases voting for the Mrs.
        
      </p>
     
			
			<div>
				<img
					src='https://cdn.sanity.io/images/pu5wtzfc/production/625b22427c884a3810e41a1ec82c29c0b48271f5-1200x749.jpg/lost-and-found-air-jordan-1-high-og-chicago-reimagined-dz5485-612-release-date-1-1.jpg?w=1024&h=639&auto=format'
					alt='test'
				/>
			</div>
		</div>
    </>
	);
}
