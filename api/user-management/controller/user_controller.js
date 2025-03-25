import UserModel from "../model/user_model.js";
import bcrypt from "bcrypt";
import UserToken from "../model/token_model.js";
import generateJwtTokens from "../../common/jwt_auth_utils.js";
import RoleModel from "../model/role_model.js";
import mongoose from "mongoose";
const { ObjectId } = mongoose.Types;
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: "grango153@gmail.com",
    pass: "jsihzskozzrthlnk",
  },
});

const login = async (req, res) => {
  try {
    const { username, password, countryCode } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Invalid Request Body" });
    }

    // Check if username is a number (mobile number) or a string (email)
    const query = {};
    if (!isNaN(username)) {
      if (!countryCode) {
        return res
          .status(400)
          .json({ message: "Country code is required for mobile numbers" });
      }
      query.mobileNumber = Number(username); // Convert to number
      query.countryCode = countryCode; // Include countryCode in the query
    } else {
      // If username is an email
      query.email = username;
    }

    // Find user with lean query for better performance
    const user = await UserModel.findOne(query)
      .select("+password") // Ensure password is fetched
      .lean();

    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate tokens
    const generatedTokens = await generateJwtTokens(user._id);

    // Upsert token: replace existing token or create a new one
    await UserToken.findOneAndUpdate(
      { user: user._id },
      {
        token: generatedTokens.token,
        refreshToken: generatedTokens.refreshToken,
        user: user._id,
      },
      { upsert: true, new: true }
    );

    // Set authorization header and response
    res.setHeader("Access-Control-Expose-Headers", "authorization");
    res.header("authorization", `Bearer ${generatedTokens.token}`);
    return res.status(200).json({
      message: "Authentication successful!",
      data: {
        _id: user._id,
        fullName: user.fullName,
        mobileNumber: user.mobileNumber,
        countryCode: user.countryCode,
        email: user.email,
        isVerified: user.isVerified,
        userType: user.userType,
        image: user.image,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

/**
 * Signup
 */
const signup = async (req, res) => {
  try {
    // Check if the request body is empty
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ message: "Invalid Request Body" });
    }

    const {
      email,
      mobileNumber,
      countryCode,
      password,
      userType,
      fullName,
      uId,
      isVerified,
      status,
      permissions,
    } = req.body;

    // Validate required fields
    if (!email || !mobileNumber || !password) {
      return res
        .status(400)
        .json({ message: "Email, mobile number, and password are required" });
    }

    // Ensure permissions is a list of strings (ObjectIds)
    if (
      !Array.isArray(permissions) || // Check if permissions is an array
      permissions.length === 0 || // Check if the array is empty
      !permissions.every((id) => ObjectId.isValid(id)) // Check if all elements are valid ObjectIds
    ) {
      return res.status(400).json({ message: "Invalid Permissions" });
    }

    // Check if the userType is admin (if applicable)
    if (userType && userType === 0) {
      return res
        .status(409)
        .json({ message: "Admin users cannot sign up via this endpoint" });
    }

    // Check if the user already exists
    const existingUser = await UserModel.findOne({
      $or: [{ email }, { mobileNumber }],
    });

    if (existingUser) {
      return res.status(409).json({ message: "User Already Exists!" });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);
    if (!passwordHash) {
      return res.status(500).json({ message: "Error in hashing password" });
    }

    const role = await RoleModel.create({
      name: email,
      permissions: permissions,
    });

    // Create a new user
    const newUser = new UserModel({
      uId,
      fullName,
      mobileNumber,
      countryCode,
      email,
      isVerified,
      status,
      userType,
      role,
      password: passwordHash,
    });

    await newUser.save();

    // Generate JWT tokens
    const tokens = await generateJwtTokens(newUser._id);

    // Remove old tokens if they exist
    await UserToken.deleteOne({ user: newUser._id });

    // Save new tokens
    await UserToken.create({
      token: tokens.token,
      refreshToken: tokens.refreshToken,
      user: newUser._id,
    });

    // Send response with token in headers
    res.setHeader("Access-Control-Expose-Headers", "authorization");
    res.header("authorization", `Bearer ${tokens.token}`);

    await transporter.sendMail({
      from: '"Aspiration Asia Trekking and Expedition Pvt Ltd" <ajit@aspirationasia.com>', // sender address
      to: email, // list of receivers
      subject: "Aspire Ledger App Login Details", // Subject line
      html: `<html>
          <head>
            <style>
              body {
                font-family: Arial, sans-serif;
                margin: 20px;
                padding: 20px;
                background-color: #f4f4f4;
              }
              .container {
                background-color: #fff;
                padding: 20px;
                border-radius: 5px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
              }
              h2 {
                color: #333;
              }
              .credentials {
                background-color: #f9f9f9;
                padding: 10px;
                border-radius: 5px;
                margin-top: 10px;
                border: 1px solid #ddd;
              }
              .label {
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <h2>Welcome to Aspiration Asia, ${email}!</h2>
              <p>Thank you for signing up. Below are your login credentials:</p>
              <div class="credentials">
                <p><span class="label">Username:</span> ${email}</p>
                <p><span class="label">Password:</span> ${password}</p>
              </div>
              <p>We recommend you change your password after logging in for security purposes.</p>
            </div>
          </body>
        </html>`, // html body
    });

    return res.status(201).json({
      message: "User Created Successfully",
      data: {
        uId,
        fullName,
        mobileNumber,
        countryCode,
        email,
        isVerified,
        status,
        userType,
        role,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "oops! Something went wrong" });
  }
};

const getAllUsers = async (req, res) => {
  try {
    if (!process.env.MAIN_EMAIL) {
      return res.status(500).json({ message: "Server configuration error." });
    }

    const users = await UserModel.find(
      {
        email: { $ne: process.env.MAIN_EMAIL },
      },
      "-password"
    ).lean();

    if (users.length > 0) {
      return res.json({
        message: "Users listed successfully!",
        data: users,
      });
    }

    return res.json({
      message: "No users found.",
      data: [],
    });
  } catch (error) {
    return res.status(500).json({
      message: "Something went wrong!",
    });
  }
};

///reset password
const resetPassword = async (req, res) => {
  try {
    // Validate request body
    if (!req.body || !req.body.uId || !req.body.password) {
      return res.status(400).json({
        message: "Invalid Request Body: uId and password are required",
      });
    }

    // Fetch user by uId
    const user = await UserModel.findOne({ uId: req.body.uId });
    if (!user) {
      return res.status(404).json({ message: "User Not Found" });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(req.body.password, 10);

    // Update user password
    const updatedUser = await UserModel.findByIdAndUpdate(
      user._id,
      { password: passwordHash },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      return res.status(500).json({ message: "Failed to update password" });
    }

    return res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default { login, resetPassword, getAllUsers, signup };
