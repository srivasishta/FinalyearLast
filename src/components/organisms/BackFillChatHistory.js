const mongoose = require("mongoose");


const userChatHistorySchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true }, // Each user has one record
    contacts: [{ type: String }] // List of userIDs they have chatted with
  });
  
  const UserChatHistory = mongoose.model("UserChatHistory", userChatHistorySchema);

// Chat Room Schema
const chatRoomSchema = new mongoose.Schema({
    participants: [
        {
            userID: { type: String, required: true },
            role: { type: String, enum: ["student", "mentor"], required: true },
            unreadMessages: { type: Number, default: 0 } // Track unread messages per user
        }
    ],
    createdAt: { type: Date, default: Date.now }
});

chatRoomSchema.post("save", async function (doc, next) {
    try {
  
      // Extract user IDs from participants
      const userIDs = doc.participants.map(p => p.userID);
  
      // Update chat history for each user
      for (let userID of userIDs) {
        const otherUsers = userIDs.filter(id => id !== userID);
  
        await UserChatHistory.findOneAndUpdate(
          { userID },
          { $addToSet: { contacts: { $each: otherUsers } } }, // Add unique contacts
          { upsert: true, new: true }
        );
      }
  
      next();
    } catch (error) {
      next(error);
    }
  });
  

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);// Import UserChatHistory model

async function backfillUserChatHistory() {
    try {
        console.log("🔄 Backfilling UserChatHistory...");

        const chatRooms = await ChatRoom.find({}); // Fetch all chat rooms

        const userChatMap = new Map();

        chatRooms.forEach(chatRoom => {
            const userIDs = chatRoom.participants.map(p => p.userID);
            userIDs.forEach(userID => {
                if (!userChatMap.has(userID)) {
                    userChatMap.set(userID, new Set());
                }
                userIDs.forEach(otherUserID => {
                    if (userID !== otherUserID) {
                        userChatMap.get(userID).add(otherUserID);
                    }
                });
            });
        });

        for (const [userID, contacts] of userChatMap.entries()) {
            await UserChatHistory.findOneAndUpdate(
                { userID },
                { $addToSet: { contacts: { $each: [...contacts] } } }, // Add unique contacts
                { upsert: true, new: true }
            );
        }

        console.log("✅ Backfill complete!");
        mongoose.connection.close();
    } catch (error) {
        console.error("❌ Error during backfill:", error);
        mongoose.connection.close();
    }
}

// Connect to MongoDB and run the script
mongoose.connect("mongodb://127.0.0.1:27017/mentorship_platform", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("🚀 Connected to MongoDB");
        backfillUserChatHistory();
    })
    .catch(error => console.error("❌ MongoDB connection error:", error));
