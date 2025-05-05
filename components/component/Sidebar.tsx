"use client";

import { BiLogOut } from "react-icons/bi";
import { useEffect, useState } from "react";
import { fetchSuggestedUsers} from "@/lib/actions/user.actions";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { sidebarLinks } from '../../constants/sidebar.js';
import { usePathname, useRouter } from 'next/navigation';
import { SignedIn, SignOutButton, useAuth } from '@clerk/nextjs';

export function Left() {
  const router = useRouter();
  const pathname = usePathname();
  const { userId } = useAuth();

   useEffect(() => {
    const handleSignOut = () => {
      router.push('/sign-in');
    };

    const signOutButton = document.querySelector('.cl-sign-out-button');
    if (signOutButton) {
      signOutButton.addEventListener('click', handleSignOut);
    }

    return () => {
      if (signOutButton) {
        signOutButton.removeEventListener('click', handleSignOut);
      }
    };
  }, [router]);

  return (
    <section className="custom-scrollbar sticky left-0 top-0 z-20 flex h-screen w-fit flex-col justify-between overflow-auto border-r border-r-color3  bg-color1 pb-5 pt-28 max-md:hidden">
      <div className="w-full flex-1 gap-6 px-6">
        {sidebarLinks.map((link) => {
          const isActive = (pathname.includes(link.route) && link.route.length > 1) || pathname === link.route;

          if (link.route === '/profile') link.route = `${link.route}/${userId}`;

          return (
            <Link
              href={link.route}
              key={link.label}
              className={`relative flex justify-start gap-4 rounded-lg p-4 ${isActive && 'bg-theme_text'}`}
            >
            <div className='font-bold h-5 text-primary_text text-heading3-bold'>{link.logo}</div>
              
              <p className='text-primary_text max-lg:hidden'>
                {link.label}
              </p>
            </Link>
          );
        })}
      </div>
      <div className='mt-10 px-6'>
        <SignedIn>
          <SignOutButton>
            <div className="flex flex-row items-center cursor-pointer gap-4 p-4 cl-sign-out-button">
              <BiLogOut className="font-bold h-7 text-primary_text text-heading2-bold "/>
              <p className='text-primary_text max-lg:hidden'>
                Logout
              </p>
            </div>
          </SignOutButton>
        </SignedIn>
      </div>
    </section>
  );
}

interface SuggestedUser {
  _id: string;
  name: string;
  image: string;
}

export function Right() {
  const [suggestions, setSuggestions] = useState<SuggestedUser[]>([]);

  const fetchSuggestions = async () => {
      try {
      const response = await fetchSuggestedUsers();
      if (!response || response.length === 0) {
        toast.error("Failed to fetch suggested users. Please try again.");
        return;
      }
      setSuggestions(response);
    } catch (error: any) {
      toast.error(`Error fetching suggestions: ${error.message}`);
    }
  };

  useEffect(() => {
     fetchSuggestions();
  }, []);

  return (
    <section className="custom-scrollbar sticky right-0 top-0 z-20 flex h-screen w-fit flex-col justify-between gap-12 overflow-auto border-l border-l-color3 bg-color1 px-10 pb-6 pt-28 max-xl:hidden  text-primary_text">
      <div className="flex flex-1 flex-col justify-start">
        <h3 className="text-heading4-medium">Suggested Users</h3>
        <section className="mt-10 flex flex-col gap-4">
          {suggestions.length > 0 ? (
            suggestions.map((user) => (
              <Link key={user._id} href={`/profile/${user._id}`}>
                <article className="flex items-center gap-2 rounded-md bg-color2 px-7 py-2">
                  <Image
                    src={user.image}
                    alt={`${user.name}'s Profile Pic`}
                    width={40}
                    height={40}
                    className="rounded-full object-cover"
                  />
                  <p className="text-small-regular text-primary_text">
                    <span className="mr-1 text-primary_text">{user.name}</span>
                  </p>
                </article>
              </Link>
            ))
          ) : (
            <p className="text-base-regular text-primary_text">
              No suggestions available
            </p>
          )}
        </section>
      </div>
    </section>
  );
}

export function Footer () {
  const pathname  = usePathname() ;
    return (
      <section className="fixed bottom-0 z-10 w-full rounded-t-3xl bg-glassmorphism p-4 backdrop-blur-lg xs:px-7 md:hidden">
        <div className="flex items-center justify-between gap-3 xs:gap-5">
        {
              sidebarLinks.map((link) => {
                const isActive = (pathname.includes(link.route) && link.route.length > 1) || pathname === link.route;
                  return (
                <Link  href={link.route}
                  key={link.label}
                  className= {`relative flex flex-col items-center gap-2 rounded-lg p-2 sm:flex-1 sm:px-2 sm:py-2.5
                      ${isActive && 'bg-theme_text'}`}> 
                    <div className='font-bold h-6 text-primary_text text-heading2-bold'>{link.logo}</div>
                    <p className= ' text-subtle-medium text-primary_text max-sm:hidden'>
                      {link.label.split(/\s+/)[0]}
                    </p>
                </Link>
              )}
            )}

        </div>
      </section>
    )
  }