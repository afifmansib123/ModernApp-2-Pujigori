import { NAVBAR_HEIGHT } from "@/lib/constants";
import Link from "next/link";
import Image from "next/image";
import { Button } from "./ui/button";

const Navbar = () => {
  {
    /*first is the main container */
  }
  return (
    <div
      className="fixed top-0 left-0 w-full z-50 shadow-xl"
      style={{ height: `${NAVBAR_HEIGHT}px` }}
    >
      {/* container for 3 divs inside */}
      <div className="flex items-center justify-between w-full h-full px-8 py-3 bg-primary-700 text-white">
        {/* logo */}
        <div className="flex justify-center gap-3">
          <Link
            href="/"
            className="cursor-pointer hover:!text-primary-300"
            scroll={false}
          >
            <div className="flex items-center gap-3">
              <Image
                src="/logo.svg"
                alt="Rentiful Logo"
                width={24}
                height={24}
                className="w-6 h-6"
              />
              <div className="text-xl font-bold">
                Puji
                <span className="text-primary-400 font-light hover:!text-primary-300">
                  Gori
                </span>
              </div>
            </div>
          </Link>
        </div>
        {/* nav items  or text */}
        <p className="text-primary-200 hidden md:block">Crowdfunding Platform</p>
        {/* buttons */}
        <div className="flex items-center gap-3">
          <Link href="/signin">
            <Button
              variant="outline"
              className="text-white border-white bg-transparent hover:bg-white hover:text-primary-700 rounded-lg"
            >
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button
              variant="secondary"
              className="text-white bg-secondary-600 hover:bg-white hover:text-primary-700 rounded-lg"
            >
              Sign Up
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
