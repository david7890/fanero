import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    // Get user ID from body or use current session user
    const body = await request.json();
    let userId = body.userId;
    
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
    
    // Update user to be a creator
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        isCreator: true,
        creatorDescription: body.creatorDescription || "Creator description for testing",
        subscriptionPrice: parseFloat(body.subscriptionPrice || "4.99"),
        bannerImage: body.bannerImage || null,
        socialLinks: body.socialLinks || {
          twitter: "https://twitter.com/example",
          instagram: "https://instagram.com/example"
        }
      },
      select: {
        id: true,
        name: true,
        isCreator: true,
        creatorDescription: true,
        subscriptionPrice: true
      }
    });
    
    return NextResponse.json({
      success: true,
      message: "User updated successfully to creator status",
      user: updatedUser
    });
    
  } catch (error) {
    console.error("Error making user a creator:", error);
    return NextResponse.json({ 
      success: false, 
      message: "Error making user a creator" 
    }, { status: 500 });
  }
} 