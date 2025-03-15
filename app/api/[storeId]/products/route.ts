import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "@/lib/prismadb";

export async function POST(
    req: Request,
    { params }: {params: { storeId: string}}
) {
    try{
        const { userId } = await auth();
        const body = await req.json();

        const { 
            name, 
            price,
            colorId,
            categoryId,
            sizeId,
            image,
            isFeatured,
            isArchived,
         } = body;

        if(!userId) {
            return new NextResponse("Unauthenticatd",{status: 401});
        }

        if(!name) {
            return new NextResponse("Label is Required", { status: 400 });
        }

        if(!image || !image.length) {
            return new NextResponse("ImageUrl is Required", { status: 400 });
        }

        if(!price) {
            return new NextResponse("Price is Required", { status: 400 });
        }

        if(!categoryId) {
            return new NextResponse("Category is Required", { status: 400 });
        }

        if(!sizeId) {
            return new NextResponse("Size is Required", { status: 400 });
        }

        if(!colorId) {
            return new NextResponse("Color is Required", { status: 400 });
        }

        if(!params.storeId) {
            return new NextResponse("Store Id is Required", { status: 400 });
        }

        const storeByUserId = await prismadb.store.findFirst({
            where: {
                id: params.storeId,
                userId
            }
        });

        if(!storeByUserId) {
            return new NextResponse("Unauthorize" , {status: 403});
        }

        const product = await prismadb.product.create({
            data: {
                name,
                price,
                colorId,
                sizeId,
                categoryId,
                isArchived,
                isFeatured,
                storeId: params.storeId,
                image: {
                    createMany: {
                        data: [
                            ...image.map((img: {url:string}) => img)
                        ]
                    }
                }
            }
        });

        return NextResponse.json(product);
    } catch(error){
        console.error("Error In POST--Products",error);
        return new NextResponse("Internal server error", {status:500});
    }
};


export async function GET(
    req: Request,
    { params }: {params: { storeId: string}}
) {
    try{
        const { searchParams } = new URL(req.url);
        const categoryId = searchParams.get("categoriesId") || undefined;
        const colorId = searchParams.get("colorId") || undefined;
        const sizeId = searchParams.get("sizeId") || undefined;
        const isFeatured = searchParams.get("isFeatured");


        if(!params.storeId) {
            return new NextResponse("Store Id is Required", { status: 400 });
        }

        

        const products = await prismadb.product.findMany({
            where: {
                storeId: params.storeId,
                categoryId,
                colorId,
                sizeId,
                isFeatured: isFeatured ? true : undefined,
                isArchived: false
            },
            include :{
                image: true,
                category: true,
                color: true,
                size: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        return NextResponse.json(products);
    } catch(error){
        console.error("Error In GET--Category",error);
        return new NextResponse("Internal server error", {status:500});
    }
};