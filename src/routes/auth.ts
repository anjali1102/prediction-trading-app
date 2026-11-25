import { User } from "@/models/User";
import bcrypt from "bcrypt";

export async function signup(req) {
  console.log("Signup request received");
  try {
    const { username, password } = await req.json();
    const hashedPassword = await bcrypt.hash(password, 10);
    const createdUserDocument = await User.create({
      username,
      password: hashedPassword,
    });

    return Response.json({
      message: "Signup successful",
      status: 200,
      data: { userid: createdUserDocument._id, username },
    });
  } catch (err) {
    console.error("Error during signup:", err);
    return Response.json({ message: "Signup failed" }, { status: 500 });
  }
}
