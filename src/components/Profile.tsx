import React from 'react'
import { Button } from './ui/button'
import Link from 'next/link'
import useUser from '@/app/hook/useUser'
import Image from "next/image";
import { supabaseBrowser } from '@/lib/supabase/browser'
import { useQueryClient } from '@tanstack/react-query'
import { usePathname, useRouter } from "next/navigation";
import { protectedPaths } from '@/lib/constant'
import { Gem } from 'lucide-react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu'
import { Avatar, AvatarFallback } from './ui/avatar'
import { Icons } from './Icons'

export default function Profile() {
  const { isFetching, data: user } = useUser();
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();
  const isActive = !user?.subscription?.end_at ? false : new Date(user.subscription.end_at) > new Date();

  if (isFetching) {
    return <></>
  }

  const handleLogout = async () => {
    const supabase = supabaseBrowser();
    queryClient.clear();
    await supabase.auth.signOut();
    router.refresh();
    if (protectedPaths.includes(pathname)) {
      router.replace("/auth?next=" + pathname);
    }
  }

  return (
    <div className="flex items-center justify-center h-full">
      {!user?.id ? (
        <Link href="/auth">
          <Button variant="outline">Sign In</Button>
        </Link>
      ) : (
        <DropdownMenu>
          <DropdownMenuTrigger asChild className='overflow-visible'>
            <Button className='rounded-full w-8 h-8 p-0'>
              <Avatar className='w-8 h-8'>
                {user.image_url ? (
                  <div className='relative w-full h-full'>
                    <Image
                      className='object-cover'
                      fill
                      src={user.image_url}
                      alt='profile picture'
                      referrerPolicy='no-referrer'
                    />
                  </div>
                ) : (
                  <AvatarFallback className="flex items-center justify-center">
                    <span className='sr-only'>{user.display_name}</span>
                    <Icons.user className='h-4 w-4 text-zinc-900' />
                  </AvatarFallback>
                )}
              </Avatar>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align='end' className="tweet-border bg-gray-900/80 backdrop-blur-lg">
            <div className='flex items-center justify-start gap-2 p-2'>
              <div className='flex flex-col space-y-0.5 leading-none'>
                {user.display_name && (
                  <p className='font-medium text-sm text-white'>
                    {user.display_name}
                  </p>
                )}
                {user.email && (
                  <p className='w-[200px] truncate text-xs text-zinc-200'>
                    {user.email}
                  </p>
                )}
              </div>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <Link href='/home'>Dashboard</Link>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
              {isActive ? (
                <Link href='/home/billing'>
                  Manage Subscription
                </Link>
              ) : (
                <Link href='/subscription'>
                  Upgrade{' '}
                  <Gem className='text-gray-300 h-4 w-4 ml-1.5' />
                </Link>
              )}
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem className='cursor-pointer'>
              <div onClick={handleLogout} className="py-2 font-bold text-red-500">Log out</div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}