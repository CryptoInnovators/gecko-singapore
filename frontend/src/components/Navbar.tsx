"use client"

import * as React from "react"
import Link from "next/link"
import { Button } from "./ui/button"
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet"
import { Menu } from "lucide-react"
import Profile from "./Profile"
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "./ui/navigation-menu"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip"
import { HomeIcon, FileTextIcon } from "@radix-ui/react-icons"
import { cn } from "../lib/utils"

const NavMenu = ({ orientation = "horizontal" }: { orientation?: "horizontal" | "vertical" }) => {
  const menuItems = [
    { title: "Home", href: "/home", tooltip: null, icon: <HomeIcon className="mr-2" /> },
    { title: "Pricing", href: "/subscription", tooltip: null, icon: <FileTextIcon className="mr-2" /> },
  ]

  if (orientation === "vertical") {
    return (
      <ul className="space-y-2">
        {menuItems.map((item) => (
          <li key={item.title}>
            <Link
              href={item.href}
              className="flex items-center text-sm font-medium text-foreground hover:text-accent-foreground"
            >
              {item.icon}
              {item.title}
            </Link>
          </li>
        ))}
      </ul>
    )
  }

  return (
    <NavigationMenu>
      <NavigationMenuList>
        {menuItems.map((item) => (
          <NavigationMenuItem key={item.title}>
            {item.tooltip ? (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <NavigationMenuLink asChild>
                      <Link href={item.href} className={cn(navigationMenuTriggerStyle(), "flex items-center")}>
                        {item.icon}
                        {item.title}
                      </Link>
                    </NavigationMenuLink>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{item.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ) : (
              <NavigationMenuLink asChild>
                <Link href={item.href} className={cn(navigationMenuTriggerStyle(), "flex items-center")}>
                  {item.icon}
                  {item.title}
                </Link>
              </NavigationMenuLink>
            )}
          </NavigationMenuItem>
        ))}
      </NavigationMenuList>
    </NavigationMenu>
  )
}

export function NavBar() {
  return (
    <nav className='sticky top-0 left-0 right-0 z-50 h-14 w-full border-b border-gray-700 backdrop-blur-2xl bg-opacity-30 shadow-sm'>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-16 relative">
        <div className="flex justify-between items-center h-14">
          {/* Left side - Logo and Text */}
          <div className="flex-shrink-0 absolute left-2 sm:left-2 lg:left-8">
            <Link href="/" className="flex items-center">
              <img src="/gecko.png" alt="Gecko Logo" className="h-7 w-auto" />
              <span className="text-base font-normal text-foreground ml-2">Gecko</span>
            </Link>
          </div>
          
          {/* Center - Navigation Menu (always centered) */}
          <div className="flex-grow flex justify-center items-center">
            <div className="hidden md:flex items-center space-x-4">
              <NavMenu />
            </div>
          </div>

          {/* Right side - Profile and Mobile Menu */}
          <div className="flex-shrink-0 absolute right-4 sm:right-8 lg:right-12 flex items-center space-x-4">
            <div className="hidden md:flex items-center justify-center h-full">
              <Profile />
            </div>
            
            {/* Mobile Menu - Only visible on small screens */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <nav className="flex flex-col space-y-8">
                  <NavMenu orientation="vertical" />
                  <Profile />
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default NavBar;