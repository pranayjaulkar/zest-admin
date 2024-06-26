import prisma from "@/prisma/client";
import categorySchema from "@/zod/categorySchema";
import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET(req: Request, { params }: { params: { storeId: string } }) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const categories = await prisma.category.findMany({
      where: { storeId: params.storeId },
    });
    return NextResponse.json(categories);
  } catch (error) {
    console.trace("[Category_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request, { params }: { params: { storeId: string; billboardId: string } }) {
  try {
    const { userId } = auth();
    const body = await req.json();

    try {
      categorySchema.parse(body);
    } catch (error) {
      return NextResponse.json({ message: "Invalid category data" }, { status: 400 });
    }

    const { name, billboardId } = body;

    const storeByUserId = await prisma.store.findUnique({
      where: { id: params.storeId, userId: userId! },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }
    const category = await prisma.category.create({
      data: {
        name,
        billboardId,
        storeId: params.storeId,
      },
    });
    return NextResponse.json(category);
  } catch (error) {
    console.trace("[Category_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
