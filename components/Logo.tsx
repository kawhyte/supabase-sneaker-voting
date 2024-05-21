import Link from "next/link";

export default function Logo() {
  return (
    <Link
      className="py-2 px-3 flex justify-between items-baseline rounded-md no-underline hover:bg-btn-background-hover "
      href="/"
   
      rel="noreferrer"
    >
      {/* <svg
        aria-label="Vercel logomark"
        role="img"
        viewBox="0 0 74 64"
        className="h-4 w-4 "
      >
        <path
          d="M37.5896 0.25L74.5396 64.25H0.639648L37.5896 0.25Z"
          fill="currentColor"
        ></path>
      </svg> */}

      <div> 
<svg xmlns="http://www.w3.org/2000/svg"  className="h-7 w-7 "  zoomAndPan="magnify" viewBox="0 0 375 374.999991"  preserveAspectRatio="xMidYMid meet" version="1.0">
  <defs>
    <g/>
  </defs>
  <rect x="-37.5" width="450" fill="#ffffff" y="-37.499999" height="449.999989" fillOpacity="1"/>
  <rect x="-37.5" width="450" fill="#ff4cba" y="-37.499999" height="449.999989" fillOpacity="1"/>
  <g fill="#ffffff" fillOpacity="1">
    <g transform="translate(38.749455, 309.090014)">
      <g>
        <path d="M 72.03125 0 L 30.078125 0 L 30.078125 -231.453125 L 89.921875 -231.453125 L 148.5 -61.265625 L 151.8125 -61.265625 L 210.078125 -231.453125 L 268.5 -231.453125 L 268.5 0 L 225.109375 0 L 225.109375 -152.921875 L 221.15625 -153.5625 L 167.65625 0 L 129.5 0 L 75.984375 -153.5625 L 72.03125 -152.921875 Z M 72.03125 0 "/>
      </g>
    </g>
  </g>
</svg>
</div>


     
    </Link>
  );
}
