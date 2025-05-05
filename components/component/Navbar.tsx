"use client"


import { useState, useEffect } from "react";
import { BiLogOut } from "react-icons/bi";
import { OrganizationSwitcher, SignedIn, SignOutButton } from "@clerk/nextjs";
import Link from "next/link";
import { SiPersonio } from "react-icons/si";
 



function Navbar() {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      setTheme(savedTheme);
      document.body.classList.add(savedTheme);
    } else {
      document.body.classList.add(theme);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.body.classList.remove("light", "dark");
    document.body.classList.add(newTheme);
  };

  return (
    <nav className="fixed top-0 z-30 w-full  bg-color2 px-6 py-3 flex justify-between items-center p-4">
      <Link href="/" className="flex items-center gap-4">
        <SiPersonio className="text-3xl text-primary_text font-extrabold border-4 border-theme_text h-10 w-10 p-1 rounded-xl text-heading1-bold" onClick={toggleTheme}/>
        <p className="text-heading3-bold text-primary_text max-xs:hidden">Stringz</p>
      </Link>

      <div className="flex items-center gap-4">

      <div onClick={toggleTheme}
      className="relative w-14 h-7 bg-gray-300 dark:bg-gray-800 rounded-full flex items-center cursor-pointer shadow-md">
      <div
        className={`absolute w-7 h-7 bg-yellow-400 dark:bg-gray-900 rounded-full shadow-lg transform transition-transform duration-300 ${
          theme === 'dark' ? 'translate-x-7' : 'translate-x-0'
        }`}
      />
      <span className={`absolute left-1 text-sm text-gray-500 dark:text-gray-400 ${theme === "dark" ?  "hidden" : ""}`}>
        ☀️
      </span>
      <span className={`absolute right-1 text-sm text-gray-500 dark:text-gray-400 ${theme === "light" ?  "hidden" : ""}`}>
        🌙
      </span>
      </div>
        

        <div className="block md:hidden">
          <SignedIn>
            <SignOutButton>
              <div className="flex cursor-pointer">
              <BiLogOut className="font-bold h-6 text-primary_text text-heading2-bold "/>
              </div>
            </SignOutButton>
          </SignedIn>
        </div>

        <OrganizationSwitcher
          appearance={{
            elements: { orgaizationSwitcherTrigger: "py-2  px-4" },
          }}
        />
      </div>
    </nav>
  );
}

export default Navbar;
