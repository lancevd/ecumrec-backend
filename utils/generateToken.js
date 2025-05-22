import jwt from "jsonwebtoken";

export default function generateToken(userID, res) {
  const token = jwt.sign({ userID }, process.env.JWT_SECRET, {
    expiresIn: "3d",
  });

  res.cookie("token", token, {
    httpOnly: true,
    // secure: process.env.NODE_ENV === "production",
    secure: true,
    sameSite: "None",
    path: "/",
    maxAge: 3 * 24 * 60 * 60 * 1000,
  });
}
