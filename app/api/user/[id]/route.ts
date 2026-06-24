import { NextRequest, NextResponse } from "next/server";
import prisma from '@/prisma/client'
import { parse } from "path";


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

// PUT
export async function PUT(request: NextRequest, { params }: Props) {
    try {
        const { id } = await params;
        const userID = parseInt(id);

        const body = await request.json();

        const updatedUser = await prisma.users.update({
            where: { id: userID },
            data: {
                name: body.name,
                email: body.email,
                password: body.password

            }
        }
        )
        return NextResponse.json(updatedUser)
    } catch (error) {
        return NextResponse.json({ message: "Could not update the user", error: String(error) }, { status: 500 })
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
        }

        )
        return NextResponse.json({ message: " Following User is deleted ", deletedUser })
    } catch (error) {
        return NextResponse.json('Could not delete the user', { status: 500 })
    }

}