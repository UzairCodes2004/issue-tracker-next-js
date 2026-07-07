import { NextResponse } from "next/server";
import prisma from '@/prisma/client'


export async function GET(){

    try {
        const users = await prisma.users.findMany({});
        // Remove password field from each user
        const usersWithoutPassword = users.map(({ password, ...user }) => user);
        return NextResponse.json(usersWithoutPassword);
    } catch (error) {
        console.error("GET /api/user error:", error);
        return NextResponse.json(
            { error: "Failed to fetch users" },
            { status: 500 }
        );
    }
}