import { NextRequest, NextResponse } from "next/server";
import schema from "./schema";
import prisma from "@/prisma/client";
export async function POST(request:NextRequest){

    const body=await request.json()

    const validation =schema.safeParse(body)

    if (!validation.success)
        return NextResponse.json(validation.error.issues,{status:400})

    const newIssue =await prisma.issue.create({

       data:{

title:body.title,
description:body.description
       }

    });
    return NextResponse.json(newIssue,{status:201})
}
