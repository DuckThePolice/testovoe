import { IncomingMessage } from "http";
import { decode } from "jwt-js-decode";
export function getUserIdFromJwt(headers: IncomingMessage["headers"]) {
  const authHeader = headers.authorization || "";
  if (!authHeader.startsWith("Bearer ")) {
    return false;
  }
  const token = authHeader.split(" ")[1];
  let user_jwt = decode(token);
  return user_jwt.payload.userId;
}
