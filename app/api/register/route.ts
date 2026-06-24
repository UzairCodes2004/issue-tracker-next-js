import { NextRequest, NextResponse } from "next/server";
import prisma from "@/prisma/client";
import bcrypt from "bcrypt"
import registerSchema from "./schema";



export async function POST(request:NextRequest){

    try {
        const body = await request.json();
        const validation = registerSchema.safeParse(body);
        if(!validation.success)
            return NextResponse.json(validation.error.issues,{status:400})

        const {name,email,password}=body

    const existing = await prisma.users.findUnique({ where: { email } });
    if (existing)
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });



   const hashed = await bcrypt.hash(password, 10);

    const newUser = await prisma.users.create({
      data: { name, email, password: hashed },
    });

    
    const { password: _, ...userData } = newUser;
    return NextResponse.json(userData, { status: 201 });
}   catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }}
