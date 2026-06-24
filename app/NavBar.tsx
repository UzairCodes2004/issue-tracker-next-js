'use client'
import React from 'react'
import { usePathname } from 'next/navigation';
import Link from 'next/link'
import { FaBug } from "react-icons/fa";
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@radix-ui/themes';

const NavBar = () => {
    const currentpath = usePathname()
    const { status, data: session } = useSession()

    return (
        <nav className='flex border-b mb-5 px-5 h-14 items-center justify-between'>
            <div className='flex items-center space-x-5'>
                <Link href="/">
                    <FaBug />
                </Link>
                <Link href="/" className={`${currentpath === '/' ? 'text-zinc-900 font-medium' : 'text-zinc-500'} hover:text-zinc-800 transition-colors`}>
                    DashBoard
                </Link>
                <Link href="/issues" className={`${currentpath.startsWith('/issues') ? 'text-zinc-900 font-medium' : 'text-zinc-500'} hover:text-zinc-800 transition-colors`}>
                    Issues
                </Link>
            </div>

            <div className='flex items-center space-x-4'>
                {status === "loading" && <span className='text-sm text-zinc-400'>...</span>}
                
                {status === "authenticated" && (
                    <div className='flex items-center space-x-3'>
                        <span className='text-sm text-zinc-600 font-medium'>{session.user?.email}</span>
                        <button 
                            onClick={() => signOut({ callbackUrl: '/' })}
                            className='text-sm text-red-500 hover:text-red-700 transition-colors font-medium cursor-pointer'
                        >
                            Log Out
                        </button>
                    </div>
                )}

                {status === "unauthenticated" && (
                    <div className='flex items-center space-x-3'>
                        <Link href="/login" className='text-sm text-zinc-500 hover:text-zinc-800 transition-colors font-medium'>
                            Login
                        </Link>
                        <Link href="/register" className='text-sm text-zinc-500 hover:text-zinc-800 transition-colors font-medium'>
                            Register
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    )
}

export default NavBar

