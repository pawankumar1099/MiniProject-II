import { StreamClient } from "@stream-io/node-sdk";
import "dotenv/config";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  throw new Error("STREAM_API_KEY and STREAM_API_SECRET are required");
}

const streamClient = new StreamClient(apiKey, apiSecret);
const tokenClockSkewSeconds = 30;

export const streamApiKey = apiKey;

export const upsertStreamUsers = async (users) => {
  await streamClient.upsertUsers(users);
  return users;
};

export const upsertStreamUser = async (userData) => {
  await upsertStreamUsers([userData]);
  return userData;
};

export const generateStreamToken = (userId) => {
  const issuedAt = Math.floor(Date.now() / 1000);
  return streamClient.generateUserToken({
    user_id: userId.toString(),
    iat: issuedAt - tokenClockSkewSeconds,
    exp: issuedAt + 3600,
  });
};