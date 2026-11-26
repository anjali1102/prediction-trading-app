import { User } from "@/models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
  } catch (err) {
    console.error("Error during signup:", err);
    const response: SignupFailureResponse = { message: "Signup failed" };
    return Response.json(response, { status: 500 });
  }
}

export async function login(req: Request): Promise<Response> {
  try {
    const { username, password } = await req.json();

    const IsLoginUserExist = await User.findOne({ username: username });
    if (!IsLoginUserExist) {
      return Response.json(
        { message: "User not found, Please Signup" },
        { status: 404 },
      );
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      IsLoginUserExist.password,
    );
    if (!isPasswordValid) {
      return Response.json({ message: "Invalid password" }, { status: 401 });
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign({ sub: IsLoginUserExist._id.toString() }, secret, {
      expiresIn: "1h",
    });

    return Response.json({
      message: "Login successful",
      status: 200,
      data: {
        userid: IsLoginUserExist._id,
        username: IsLoginUserExist.username,
        token,
      },
    });
  } catch (err) {
    return Response.json(
      {
        message: "Login failed",
      },
      { status: 500 },
    );
  }
}

async function getAuthenticatedUserId(
  req: Request,
): Promise<string | Response> {
  const authorization = req.headers.get("Authorization");
  const token = authorization?.match(/^Bearer\s+(.+)$/i)?.[1];
  if (!token) {
    return Response.json(
      { message: "Authentication required" },
      { status: 401 },
    );
  }

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    return Response.json(
      { message: "Authentication is unavailable" },
      { status: 500 },
    );
  }

  try {
    const payload = jwt.verify(token, secret);
    if (typeof payload === "string" || typeof payload.sub !== "string") {
      return Response.json({ message: "Invalid token" }, { status: 401 });
    }
    return payload.sub;
  } catch (err) {
    if (err instanceof jwt.JsonWebTokenError) {
      return Response.json(
        { message: "Invalid or expired token" },
        { status: 401 },
      );
    }

    return Response.json({ message: "Authentication failed" }, { status: 500 });
  }
}

export async function onRamp(req: Request): Promise<Response> {
  const userId = await getAuthenticatedUserId(req);
  if (userId instanceof Response) {
    return userId;
  }

  let amount: number;
  try {
    ({ amount } = await req.json());
  } catch {
    return Response.json(
      { message: "Invalid JSON request body" },
      { status: 400 },
    );
  }

  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return Response.json(
      { message: "Amount must be a positive numerical type" },
      { status: 400 },
    );
  }

  try {
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { balance: amount } },
      { new: true },
    );
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }
    return Response.json({ balance: user.balance });
  } catch (err) {
    return Response.json(
      { message: "Unable to update balance" },
      { status: 500 },
    );
  }
}

export async function profile(req: Request): Promise<Response> {
  const userId = await getAuthenticatedUserId(req);
  if (userId instanceof Response) {
    return userId;
  }

  try {
    const user = await User.findById(userId).select("username balance");
    if (!user) {
      return Response.json({ message: "User not found" }, { status: 404 });
    }
    return Response.json({
      username: user.username,
      balance: user.balance ?? 0,
    });
  } catch (err) {
    return Response.json(
      { message: "Unable to retrieve profile" },
      { status: 500 },
    );
  }
}
