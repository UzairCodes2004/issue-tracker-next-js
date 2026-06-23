import { NextResponse,NextRequest } from "next/server";
import prisma from "@/prisma/client";
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