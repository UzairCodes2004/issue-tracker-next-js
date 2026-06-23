'use client'
import React from 'react'
import { usePathname } from 'next/navigation';
import Link from 'next/link'
import { FaBug } from "react-icons/fa";
const NavBar = () => {
    const currentpath = usePathname()
    return (
        <nav className='flex space-x-6'>

            <ul className='flex space-x-5 border-b mb-5 padding-x-5 h-14 items-center' >
                <li><Link href="/">
                    <FaBug />
                </Link></li>
                <li>
                    <Link href="/" className='text-zinc-500 hover:text-zinc-800 transition-colors'>
                        DashBoard
                    </Link>
                </li>
                <li><Link className='text-zinc-500 hover:text-zinc-800 transition-colors' href="/issues">
                    Issues
                </Link></li>
            </ul>
        </nav>
    )
}

export default NavBar
