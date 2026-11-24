import { generateStreamToken, streamApiKey, upsertStreamUsers } from "../lib/stream.js";
import User from "../models/User.js";

export async function getStreamToken(req, res) {
  try {
    const streamUsers = [
      {
        id: req.user._id.toString(),
        name: req.user.fullName,
        image: req.user.profilePic || "",
      },
    ];
    const { targetUserId } = req.query;

    if (targetUserId && typeof targetUserId !== "string") {
      return res.status(400).json({ message: "Invalid target user ID" });
    }

    if (targetUserId) {
      const friendIds = req.user.friends.map((friendId) => friendId.toString());
      if (!friendIds.includes(targetUserId)) {
        return res.status(403).json({ message: "You can only chat with friends" });
      }

      const friend = await User.findById(targetUserId).select("fullName profilePic");
      if (!friend) {
        return res.status(404).json({ message: "Friend not found" });
      }

      streamUsers.push({
        id: friend._id.toString(),
        name: friend.fullName,
        image: friend.profilePic || "",
      });
    }

    await upsertStreamUsers(streamUsers);
    const token = generateStreamToken(req.user.id);

    res.status(200).json({ token, apiKey: streamApiKey });
  } catch (error) {
    console.log("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}