import NextLogo from "./NextLogo";
import SupabaseLogo from "./SupabaseLogo";

export default function Footer() {
	return (
		<footer className="w-full mt-9 border-t border-t-foreground/10 p-8 flex justify-center text-center text-xs">
        <p>
          Created for{" "}
          <a
            href="https://www.meetthewhytes.com/"
            target="_blank"
            className="font-bold hover:underline"
            rel="noreferrer"
          >
            Meet the Whytes
          </a>
        </p>
      </footer>
	);
}
