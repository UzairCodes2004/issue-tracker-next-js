import { NextResponse,NextRequest } from "next/server";
import prisma from "@/prisma/client";

// GET SINGLE ISSUE
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const issueId = parseInt(id);

    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
    });

    if (!issue) {
      return NextResponse.json({ message: "Issue not found" }, { status: 404 });
    }

    return NextResponse.json(issue);
  } catch (error) {
    return NextResponse.json(
      { message: "Failed to fetch issue" },
      { status: 500 }
    );
  }
}

// UPDATE ISSUE
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const issueId = parseInt(id);

    const body = await request.json();

    const updated = await prisma.issue.update({
      where: { id: issueId },
      data: {
        title: body.title,
        description: body.description,
        status: body.status,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json(
      { message: "Update failed" },
      { status: 500 }
    );
  }
}

// DELETE ISSUE
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = await params;
    const issueId = parseInt(id);

    await prisma.issue.delete({
      where: { id: issueId },
    });

    return NextResponse.json({ message: "Deleted successfully" });
  } catch (error) {
    return NextResponse.json(
      { message: "Delete failed" },
      { status: 500 }
    );
  }
}