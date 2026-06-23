import { NextRequest, NextResponse } from "next/server";
import schema from "./schema";
import prisma from "@/prisma/client";


export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    
    const validation = schema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(validation.error.issues, { status: 400 });
    }

    
    const newIssue = await prisma.issue.create({
      data: {
        title: body.title,
        description: body.description,
      },
    });

    return NextResponse.json(newIssue, { status: 201 });
  } catch (error) {
    console.error("POST /api/issues error:", error);
    return NextResponse.json(
      { error: "Failed to create issue" },
      { status: 500 }
    );
  }
}
// Get All The Issues 
export async function GET() {
   try {
     const issues = await prisma.issue.findMany({
    orderBy:{createdAT:"asc"}
     })
     return NextResponse.json(issues,{status:200})
   } catch (error) {
    console.error("GET /api/issues error:", error);
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: 500 })
   }
};

