import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/options";
import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/user.model";
import { User } from "next-auth";
import mongoose from "mongoose";

export async function POST(request: Request) {
  await dbConnect();

  const session = await getServerSession(authOptions)
  const user: User = session?.user as User

  if (!session || !session.user) {
    return Response.json({
      success: false,
      message: "Not Authenticated"
    }, { status: 401 })
  }

  const userId = new mongoose.Types.ObjectId(user._id); //to convert string _id to ObjectId
  try {
    const user = await userModel.aggregate([
      { $match: { id: userId } },
      { $unwind: '$messages' },
      { $sort: { '$messages.createdAt': -1 } },
      { $group: { _id: '$_id', message: { $push: '$messages' } } },
    ])
    if (!user || user.length === 0) {
      return Response.json({
        success: false,
        message: "User not found"
      }, { status: 401 })
    }

    return Response.json({
      success: true,
      messages: user[0].messages
    }, { status: 200 })

  } catch (error) {
    console.error("An expected error occured", error);

    return Response.json({
      success: false,
      message: "Error getting messages"
    }, { status: 401 })
  }
} 