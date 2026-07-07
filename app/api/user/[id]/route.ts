import { NextRequest, NextResponse } from "next/server";
import prisma from '@/prisma/client';
import bcrypt from 'bcrypt';


interface Props {
    params: Promise<{ id: string }>
}


export async function GET(request: NextRequest, { params }: Props) {

    const { id } = await params

    const userID = parseInt(id);

    if (isNaN(userID)) {
        return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const user = await prisma.users.findUnique({
        where: { id: userID },
    });

    if (!user) {
        return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { password, ...userData } = user;
    return NextResponse.json(userData);
}


export async function PUT(request: NextRequest, { params }: Props) {
    try {
        const { id } = await params;
        const userID = parseInt(id);

        if (isNaN(userID)) {
            return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
        }

        const body = await request.json();

        // Build update data - only hash password if provided
        const updateData: { name?: string; email?: string; password?: string } = {};
        if (body.name) updateData.name = body.name;
        if (body.email) updateData.email = body.email;
        if (body.password && body.password.trim() !== '') {
            updateData.password = await bcrypt.hash(body.password, 10);
        }

        const updatedUser = await prisma.users.update({
            where: { id: userID },
            data: updateData,
        });

        const { password, ...userData } = updatedUser;
        return NextResponse.json(userData);
    } catch (error) {
        console.error("PUT /api/user/[id] error:", error);
        return NextResponse.json({ error: "Could not update the user" }, { status: 500 });
    }
}

// DELETE
export async function DELETE(request: NextRequest, { params }: Props) {
    try {
        const { id } = await params;
        const userID = parseInt(id);
        const deletedUser = await prisma.users.delete({
            where: {
                id: userID
            }
        });
        const { password, ...userData } = deletedUser;
        return NextResponse.json({ message: "Following User is deleted", deletedUser: userData });
    } catch (error) {
        console.error("DELETE /api/user/[id] error:", error);
        return NextResponse.json({ error: 'Could not delete the user' }, { status: 500 });
    }
}