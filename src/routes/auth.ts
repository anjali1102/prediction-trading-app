import { User } from "@/models/User";
import bcrypt from "bcrypt";

interface SignupRequestBody {
  username: string;
  password: string;
}

interface SignupSuccessData {
  userid: unknown;
  username: string;
}

interface SignupSuccessResponse {
  message: string;
  status: number;
  data: SignupSuccessData;
}

interface SignupFailureResponse {
  message: string;
}

export async function signup(req: Request): Promise<Response> {
  console.log("Signup request received");
  try {
    const { username, password }: SignupRequestBody = await req.json();
    const hashedPassword: string = await bcrypt.hash(password, 10);
    const createdUserDocument = await User.create({
      username,
      password: hashedPassword,
    });

    const response: SignupSuccessResponse = {
      message: "Signup successful",
      status: 200,
      data: { userid: createdUserDocument._id, username },
    };

    return Response.json(response);
  } catch (err: unknown) {
    console.error("Error during signup:", err);
    const response: SignupFailureResponse = { message: "Signup failed" };
    return Response.json(response, { status: 500 });
  }
}
