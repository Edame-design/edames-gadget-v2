require("dotenv").config({
  path: require("path").join(__dirname, "..", ".env")
});

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/user");

async function createAdmin() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is not configured.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to MongoDB.");
    console.log(
      "Database:",
      mongoose.connection.name
    );

    const email = "edamejames086@gmail.com";
    const password = "ChangeMe123!";

    const existingUser = await User.findOne({
      email
    });

    if (existingUser) {
      console.log("Admin account already exists.");
      return;
    }

    const passwordHash = await bcrypt.hash(
      password,
      12
    );

    const admin = await User.create({
      name: "Edame's Gadget Admin",
      email,
      passwordHash,
      role: "admin",
      isActive: true
    });

    console.log(
      "Admin account created successfully."
    );

    console.log("Email:", admin.email);
    console.log("Password:", password);
  } catch (error) {
    console.error(
      "Unable to create admin:",
      error.message
    );
  } finally {
    await mongoose.disconnect();
    console.log("MongoDB connection closed.");
  }
}

createAdmin();