import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth-compat";
import { prisma } from "@/lib/db";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

const MAX_IMAGE_URL_LENGTH = 2048;

async function saveDataUrlToFile(dataUrl: string) {
  const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (!matches) {
    throw new Error("Invalid image data.");
  }

  const [, mimeType, base64Data] = matches;
  const extension = mimeType.split("/")[1] || "png";
  const buffer = Buffer.from(base64Data, "base64");

  if (buffer.length > 10 * 1024 * 1024) {
    throw new Error("Image size exceeds 10MB limit.");
  }

  const uploadsDir = join(process.cwd(), "public", "uploads");
  if (!existsSync(uploadsDir)) {
    await mkdir(uploadsDir, { recursive: true });
  }

  const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const filePath = join(uploadsDir, fileName);
  await writeFile(filePath, buffer);

  return `/uploads/${fileName}`;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as any;

    // Users can only update their own account (unless they're ADMIN)
    if (user.id !== id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, image } = body;

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;

    if (image !== undefined) {
      if (!image || image === "") {
        updateData.image = null; // Set to null instead of empty string for Prisma
      } else if (typeof image === "string" && image.startsWith("data:")) {
        try {
          updateData.image = await saveDataUrlToFile(image);
        } catch (error: any) {
          return NextResponse.json({ error: error.message || "Invalid image data" }, { status: 400 });
        }
      } else if (typeof image === "string" && image.length > MAX_IMAGE_URL_LENGTH) {
        return NextResponse.json({ error: "Image URL too long" }, { status: 400 });
      } else if (typeof image === "string" && image.trim() !== "") {
        updateData.image = image;
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        emailVerified: true,
        role: true,
        orgRole: true,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const user = session.user as any;

    // Users can only delete their own account
    if (user.id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Error deleting user:", error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

