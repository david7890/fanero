import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    // Get user ID from query params, or use current session user if not provided
    const url = new URL(request.url);
    let userId = url.searchParams.get('userId');
    
    // Get current session
    const session = await getServerSession(authOptions);
    
    // If no userId is provided, use the current logged in user
    if (!userId && session?.user?.id) {
      userId = session.user.id;
    }
    
    if (!userId) {
      return NextResponse.json({ 
        success: false, 
        message: "No user ID provided and no user is logged in" 
      }, { status: 400 });
    }
    
    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        isCreator: true,
        creatorDescription: true,
        subscriptionPrice: true,
      }
    });
    
    if (!user) {
      return NextResponse.json({ 
        success: false, 
        message: "User not found" 
      }, { status: 404 });
    }
    
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        isCreator: user.isCreator,
        creatorDescription: user.creatorDescription,
        subscriptionPrice: user.subscriptionPrice,
      }
    });
    
  } catch (error) {
    console.error("Error checking creator status:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error checking creator status" 
    }, { status: 500 });
  }
} 