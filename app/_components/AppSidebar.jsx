"use client"
import React from 'react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from "../../components/ui/sidebar"
import Image from 'next/image'
import { Compass, GalleryHorizontalEnd, LogIn, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Button } from '../../components/ui/button'
import { SignOutButton, SignUpButton, UserButton, useUser } from '@clerk/nextjs'
const MenuOptions = [
    {
        title: 'Home',
        icon: Search,
        path: '/'
    },
    {
        title: 'Discover',
        icon: Compass,
        path: '/discover'
    },
    {
        title: 'Library',
        icon: GalleryHorizontalEnd,
        path: '/library'
    },
    {
        title: 'Sign In',
        icon: LogIn,
        path: '/sign-in'
    },
]
function AppSidebar() {
    const path = usePathname();
    const { user } =useUser();
    return (
        <Sidebar >
            <SidebarHeader className='bg-accent'>
                <Image src='/logo.png' alt='logo' width={150} height={140} />
            </SidebarHeader>
            <SidebarContent className='bg-accent'>
                <SidebarGroup >
                    <SidebarContent>
                        <SidebarMenu>
                            {MenuOptions.map((menu, index) => (
                                <SidebarMenuItem key={index}>
                                    <SidebarMenuButton asChild
                                        className={`p-5 py-6 hover:bg-transparent hover:font-bold
                            ${path?.includes(menu.path) && 'font-bold'}`}>
                                        <a href={menu.path} className=''>
                                            <menu.icon className='h-8 w-8' />
                                            <span className='text-lg'>{menu.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                        {!user?<SignUpButton mode='modal'>
                            <Button className={'rounded-full mx-4 mt-4'}>Sign Up</Button>
                        </SignUpButton>:
                        <SignOutButton>
                            <Button className={'rounded-full mx-4 mt-4'}>Logout</Button>
                            </SignOutButton>}

                    </SidebarContent>
                </SidebarGroup>
                <SidebarGroup />
            </SidebarContent>
            <SidebarFooter className='bg-accent'>
                <div className='p-4 flex flex-col gap-2 items-start'>
                    <h2 className='text-gray-500'>Try Now</h2>
                    <p className='text-gray-400'> Upgrade for image</p>
                    <Button variant={'secondary'} className='text-gray-400 mb-3'>Learn more</Button>
                    <UserButton/>
                </div>
               
            </SidebarFooter>
        </Sidebar>
    )
}

export default AppSidebar