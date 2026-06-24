import { NextResponse } from "next/server";
import prisma from '@/prisma/client'


export async function GET(){

    try {
        const users= await prisma.users.findMany({});

    return NextResponse.json(users);
    
    } catch (error) {
        
    }
}