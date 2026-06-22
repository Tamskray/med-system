import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const bearerToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7).trim() : "";
  const queryToken = typeof req.query?.token === "string" ? req.query.token.trim() : "";
  const token = bearerToken || queryToken;

  if (!token) {
    return res.status(401).json({ success: false, message: "Доступ заборонено" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    return next();
  } catch {
    return res.status(403).json({ success: false, message: "Недійсний токен" });
  }
};
