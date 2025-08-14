import dbConnect from "@/lib/dbConnect";
import userModel from "@/models/user.model";
import bcrypt from "bcrypt";

import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";

export async function POST(request: Request) {
  await dbConnect();

  try {
    const { username, email, password } = await request.json();

    const existingUserVerifiedByUsername = await userModel.findOne({
      username,
      isVerified: true,
    });

    if (existingUserVerifiedByUsername) {
      return Response.json({
        success: false,
        message: 'Username already taken',
      }, { status: 400 })
    }

    const existingUserVerifiedByEmail = await userModel.findOne({ email });
    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserVerifiedByEmail) {
      if (existingUserVerifiedByEmail.isVerified) { // when a user try to signup with verified email but different username
        return Response.json({
          success: false,
          message: "User already exist with this email",
        }, { status: 400 })

      } else {
        // username exists but not verified the email
        const hashedPassword = await bcrypt.hash(password, 10);
        existingUserVerifiedByEmail.password = hashedPassword; // over-wright the password
        existingUserVerifiedByEmail.verifyCode = verifyCode;
        existingUserVerifiedByEmail.verifyCodeExpiry = new Date(Date.now() + 3600000);

        await existingUserVerifiedByEmail.save();
      }

    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const verifyCodeExpiry = new Date();
      verifyCodeExpiry.setHours(verifyCodeExpiry.getHours() + 1);

      const newUser = new userModel({
        username,
        email,
        password: hashedPassword,
        verifyCode,
        verifyCodeExpiry,
        isVerified: false,
        isAcceptingMessage: true,
        message: [],
      });

      await newUser.save();
    }

    // send verification email
    const emailResponse = await sendVerificationEmail(email, username, verifyCode);

    // error in sending message
    if (!emailResponse.success) {
      return Response.json({
        success: false,
        message: emailResponse.message,
      }, { status: 500 })
    }
    // messsage sent successfull
    if (emailResponse.success) {
      return Response.json({
        success: true,
        message: "User registered successfully. Please verify your email",
      }, { status: 201 })
    }
  } catch (error) {
    console.error('Error registring user', error);
    return Response.json(
      {
        success: false,
        message: "Error registring user"
      },
      {
        status: 500,
      }
    )
  }
}