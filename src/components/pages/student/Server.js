const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const PORT = 5002; // ✅ Using port 5002

// Middleware
app.use(express.json());
app.use(cors());


// Create HTTP Server
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});



// ✅ MongoDB Connection
async function connectDB() {
    try {
        await mongoose.connect("mongodb://127.0.0.1:27017/mentorship_platform", {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB connection error:", err);
        process.exit(1);
    }
}
connectDB();

// ✅ User Schema (Only for student login)
const userSchema = new mongoose.Schema({
    fullName: String,
    usn: String,
    email: String,
    password: String,
});
const User = mongoose.model("User", userSchema);

// ✅ Mentor Schema
const mentorSchema = new mongoose.Schema({
    fullName: String,
    mentorID: String,
    email: String,
    password: String,
});
const Mentor = mongoose.model("Mentor", mentorSchema);

// ✅ Student Schema
const studentSchema = new mongoose.Schema({
    name: String,   // ✅ Name should match ProfilePage
    usn: String,
    mobileNumber: String,
    alternateMobileNumber: String,
    email: String,
    collegeEmail: String,
    gender: String,
    dob: String,
    graduationYear: String,
    employeeId: String, // ✅ Match frontend `employeeId`
    selectedMajors: [],
    shortBio: String,
}, { strict: false });

const Student = mongoose.model("Student", studentSchema);


// Chat Request Schema
const chatRequestSchema = new mongoose.Schema({
    studentID: { type: String, required: true },
    mentorID: { type: String, required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    createdAt: { type: Date, default: Date.now }
});

const ChatRequest = mongoose.model("ChatRequest", chatRequestSchema);

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
  

const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);

// Message Schema 
const messageSchema = new mongoose.Schema({
    chatRoomID: { type: mongoose.Schema.Types.ObjectId, ref: "ChatRoom", required: true },
    senderID: { type: String, required: true },
    message: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    readBy: [{ type: String }] // Stores userIDs who have read the message
});

const Message = mongoose.model("Message", messageSchema);

const mentorChatRequestSchema = new mongoose.Schema({
    senderID: { type: String, required: true },  // Mentor who is requesting
    receiverID: { type: String, required: true },  // Mentor who will receive the request
    status: { type: String, enum: ["pending", "accepted", "rejected"], default: "pending" },
    createdAt: { type: Date, default: Date.now }
});

const MentorChatRequest = mongoose.model("MentorChatRequest", mentorChatRequestSchema);

// ✅ SOCKET.IO Logic
io.on("connection", (socket) => {
    console.log("⚡ A user connected:", socket.id);

    // 🔹 Handle Sending Message
    socket.on("sendMessage", async ({ chatRoomID, senderID, message }) => {
        try {
            const newMessage = new Message({ chatRoomID, senderID, message, readBy: [senderID] });
            await newMessage.save();
    
            // Increment unread messages for other participants
            let updatedChat = await ChatRoom.findOneAndUpdate(
                { _id: chatRoomID },
                {
                    $inc: {
                        "participants.$[elem].unreadMessages": 1
                    }
                },
                {
                    arrayFilters: [{ "elem.userID": { $ne: senderID } }], // Only update other participants
                    new: true // Return the updated document
                }
            );

            console.log(updatedChat)
    
            if (!updatedChat) {
                console.error("Chat room not found or update failed.");
                return;
            }
    
            const messages = await Message.find({ chatRoomID })
                .sort({ timestamp: 1 })
                .select("message senderID readBy");
    
            // Emit updated messages
            io.to(chatRoomID).emit("messageUpdate", messages);
    
            // Emit unread count update
            io.to(chatRoomID).emit("unreadCountUpdate", {
                chatRoomID,
                unreadMessages: updatedChat.participants.map(participant => ({
                    userID: participant.userID,
                    unreadMessages: participant.unreadMessages
                }))
            });
    
        } catch (error) {
            console.error("Error sending message:", error);
        }
    });
    

    // 🔹 Handle Joining a Chat Room
    socket.on("joinRoom", (chatRoomID) => {
        socket.join(chatRoomID);
        console.log(`User joined room: ${chatRoomID}`);
    });

    socket.on("disconnect", () => {
        console.log("❌ A user disconnected:", socket.id);
    });
});


/* -----------------------------------
   ✅ Mentor APIs
-------------------------------------*/
app.post("/api/mentor/register", async (req, res) => {
    try {
        console.log("📩 Mentor Registration Request Received:", req.body);
        const { fullName, mentorID, email, password, phoneNumber, alternatePhoneNumber, gender, tech, employeeIn, selectedMajors, bio } = req.body;

        // Check if mentor exists
        const existingMentor = await Mentor.findOne({ $or: [{ mentorID }, { email }] });
        if (existingMentor) return res.status(400).json({ message: "Mentor ID or Email already registered" });

        // ✅ Store Mentor Authentication Info
        const newMentor = new Mentor({ fullName, mentorID, email, password });
        await newMentor.save();

        // ✅ Store Mentor Profile Details
        const newMentorDetails = new MentorDetails({
            mentorID,
            fullName,
            phoneNumber,
            alternatePhoneNumber,
            email,
            gender,
            tech,
            employeeIn,
            selectedMajors,
            bio, 
        });
        await newMentorDetails.save();


        res.status(201).json({ 
            success: true, 
            message: "Mentor Registered Successfully", 
            user: newMentor,  // 🔥 Return Full Mentor Details
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

const mentorDetailsSchema = new mongoose.Schema({
    mentorID: { type: String, required: true, unique: true },
    fullName: String,
    phoneNumber: String,
    alternatePhoneNumber: String,
    email: String,
    gender: String,
    employeeIn: String,  // Company/Organization Name
    selectedMajors: String, // Array of selected majors
    bio: String, 
    tech: String
}, { collection: "mentor_details" });

const MentorDetails = mongoose.model("MentorDetails", mentorDetailsSchema);

app.post("/api/mentors/:mentorID", async (req, res) => {
    try {
        const { mentorID } = req.params;
        console.log("📩 Fetching mentor details for:", mentorID); // ✅ Log request

        const mentorDetails = await MentorDetails.findOne({ mentorID });
        console.log("🎯 Mentor Details Found:", mentorDetails); // ✅ Log fetched data

        if (!mentorDetails) {
            return res.status(404).json({ message: "Mentor profile not found" });
        }

        res.json(mentorDetails);
    } catch (error) {
        console.error("❌ Error fetching mentor details:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

app.post("/api/mentor/login", async (req, res) => {
    try {
        const { mentorID, password } = req.body;

        if (!mentorID || !password) {
            return res.status(400).json({ success: false, message: "Missing mentorID or password" });
        }

        const mentor = await Mentor.findOne({ mentorID: String(mentorID) });

        if (!mentor || mentor.password !== password) {
            return res.status(400).json({ success: false, message: "Invalid mentorID or Password" });
        }

        res.json({ success: true, message: "Login successful", mentorID, mentor }); // ✅ Include mentorID in response
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
});

app.post("/api/mentor/details", async (req, res) => {
    try {
        console.log("📩 Received Mentor Details:", req.body);

        const { mentorID, fullName, phoneNumber, alternatePhoneNumber, email, gender, tech, employeeIn, selectedMajors, bio } = req.body;

        if (!mentorID) return res.status(400).json({ message: "mentorID is required" });

        // ✅ Check if mentor already exists
        const existingMentor = await MentorDetails.findOne({ mentorID });
        
        if (existingMentor) {
            // ✅ Update existing mentor details
            existingMentor.fullName = fullName;
            existingMentor.phoneNumber = phoneNumber;
            existingMentor.alternatePhoneNumber = alternatePhoneNumber;
            existingMentor.email = email;
            existingMentor.gender = gender;
            existingMentor.tech = tech;
            existingMentor.employeeIn = employeeIn;
            existingMentor.selectedMajors = selectedMajors;
            existingMentor.bio = bio;

            await existingMentor.save();
            console.log("✅ Mentor Details Updated:", existingMentor);
            return res.status(200).json({ success: true, message: "Mentor details updated successfully" });
        } else {
            // ✅ Create new mentor details
            const newMentorDetails = new MentorDetails({
                mentorID,
                fullName,
                phoneNumber,
                alternatePhoneNumber,
                email,
                gender,
                tech,
                employeeIn,
                selectedMajors,
                bio
            });

            await newMentorDetails.save();
            console.log("✅ Mentor Details Saved:", newMentorDetails);
            return res.status(201).json({ success: true, message: "Mentor details stored successfully" });
        }
    } catch (error) {
        console.error("❌ Error storing/updating mentor details:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

app.get("/api/mentor/details", async (req, res) => {
    try {
        const id = req.query.id;
        const currentUserID = req.query.currentUserID; // User requesting the data

        let chatHistoryMentorIDs = [];

        // Fetch chat history of the current user
        if (currentUserID) {
            const userChatHistory = await UserChatHistory.findOne({ userID: currentUserID });
            if (userChatHistory) {
                // Fetch mentors from chat history
                const mentorsInHistory = await Mentor.find({ _id: { $in: userChatHistory.contacts } }, "mentorID");
                chatHistoryMentorIDs = mentorsInHistory.map(m => m.mentorID);
            }
        }

        // If id is missing or null, fetch all mentor details excluding chat history
        if (!id || id === "null") {
            const mentors = await MentorDetails.find(
                { mentorID: { $nin: chatHistoryMentorIDs } }, // Exclude mentors in chat history
                "fullName selectedMajors bio tech _id"
            );
            return res.json(mentors);
        }

        // Fetch the mentor's mentorID using provided id
        const mentor = await Mentor.findById(id);
        if (!mentor) {
            return res.status(404).json({ message: "Mentor not found" });
        }

        const mentorID = mentor.mentorID; // Extract mentorID

        // Fetch mentor details excluding chat history mentors and the requested mentorID
        const mentors = await MentorDetails.find(
            { mentorID: { $ne: mentorID, $nin: chatHistoryMentorIDs } },
            "fullName selectedMajors bio tech _id"
        );

        res.json(mentors);
    } catch (error) {
        console.error("❌ Error fetching mentors:", error);
        res.status(500).json({ message: "Server error", error });
    }
});



/* -----------------------------------
   ✅ Student APIs
-------------------------------------*/
// ✅ Register API for Students
app.post("/api/register", async (req, res) => {
    try {
        const { fullName, usn, email, password } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ usn });
        if (existingUser) return res.status(400).json({ message: "User already exists" });

        const newUser = new User({ fullName, usn, email, password });
        await newUser.save();

        res.status(201).json({ message: "Registration successful!" , user : newUser});
    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// ✅ Student Login API (Fixed)
app.post("/api/student/login", async (req, res) => {
    try {
        const { usn, password } = req.body;

        // Find student by USN
        const student = await User.findOne({ usn });

        if (!student || student.password !== password) {
            return res.status(400).json({ success: false, message: "Invalid USN or Password" });
        }

        res.json({ success: true, message: "Login successful", student : student });
    } catch (error) {
        res.status(500).json({ success: false, message: "Server error", error });
    }
});

// ✅ Store Student Data API
app.post("/api/students", async (req, res) => {
    try {
        console.log("Received Data:", req.body);
        const newStudent = new Student(req.body);
        await newStudent.save();
        res.status(201).json({ message: "Student data saved successfully!" });
    } catch (error) {
        console.error("❌ Error saving student data:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Fetch Student Profile API (Fixed)
app.get("/api/students/:usn", async (req, res) => {
    try {
        const { usn } = req.params;
        const student = await Student.findOne({ usn });

        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }
        
        res.json(student);
    } catch (error) {
        console.error("Error fetching student data:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

app.post("/api/chat/mentor/request", async (req, res) => {
    try {
        const { senderID, receiverID } = req.body;
        const mentorDetail = await MentorDetails.findById(receiverID)
        console.log(mentorDetail)

        const mentorNewId = await Mentor.findOne({mentorID : mentorDetail.mentorID})
        console.log(mentorNewId)

        const mid = mentorNewId._id

        if (!senderID || !mid) {
            return res.status(400).json({ message: "Sender and receiver IDs are required" });
        }

        if (senderID === mid) {
            return res.status(400).json({ message: "You cannot send a request to yourself" });
        }

        // Check if a request already exists
        const existingRequest = await MentorChatRequest.findOne({
            senderID,
            receiverID: mid,
            status: "pending"
        });

        if (existingRequest) {
            return res.status(400).json({ message: "A request is already pending" });
        }

        // Create a new chat request
        const newRequest = new MentorChatRequest({ senderID, receiverID:mid });
        await newRequest.save();

        return res.json({ success: true, message: "Chat request sent successfully", request: newRequest });

    } catch (error) {
        console.error("Error sending mentor chat request:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

// ✅ Endpoint for students to send a chat request to a mentor
app.post("/api/chat/request", async (req, res) => {
    try {
        const { studentID, mentorID, message } = req.body;
        console.log(studentID, mentorID, message)

        const mentorDetail = await MentorDetails.findById(mentorID)
        console.log(mentorDetail)

        const mentorNewId = await Mentor.findOne({mentorID : mentorDetail.mentorID})
        console.log(mentorNewId)

        const mid = mentorNewId._id
        console.log(mid)
        if (!studentID || !mid || !message) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const newRequest = new ChatRequest({ studentID, mentorID : mid, message });
        await newRequest.save();

        res.json({ success: true, message: "Chat request sent successfully" });
    } catch (error) {
        console.log(error)
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// ✅ Endpoint for mentors to get chat requests
app.get("/api/chat/requests/:mentorID", async (req, res) => {
    try {
        const { mentorID } = req.params;

        // ✅ Fetch Student-to-Mentor Requests
        const studentRequests = await ChatRequest.find({ mentorID }).sort({ createdAt: -1 });

        // ✅ Extract student IDs
        const studentIDs = studentRequests.map(req => req.studentID);

        // ✅ Fetch student details
        const students = await User.find({ _id: { $in: studentIDs } });

        // ✅ Transform Student Requests
        const formattedStudentRequests = studentRequests.map(req => {
            const student = students.find(student => student._id.toString() === req.studentID);
            return {
                id: req._id,
                title: student ? student.fullName : "Unknown Student",
                description: student ? `${student.usn}` : "Student details not found",
                mail : student ? `${student.email}` : "Student email not found",
                type: "student"
            };
        });

        // ✅ Fetch Mentor-to-Mentor Requests
        const mentorRequests = await MentorChatRequest.find({ receiverID: mentorID }).sort({ createdAt: -1 });

        // ✅ Extract mentor IDs
        const mentorIDs = mentorRequests.map(req => req.senderID);

        // ✅ Fetch mentor details
        const mentors = await Mentor.find({ _id: { $in: mentorIDs } });

        // ✅ Transform Mentor Requests
        const formattedMentorRequests = mentorRequests.map(req => {
            const mentor = mentors.find(mentor => mentor._id.toString() === req.senderID);
            return {
                id: req._id,
                title: mentor ? mentor.fullName : "Unknown Mentor",
                description: mentor ? `${mentor.mentorID}` : "Mentor email not found",
                mail : mentor ? `${mentor.email}` : "Mentor details not found",
                type: "mentor"
            };
        });

        // ✅ Merge Both Requests
        const allRequests = [...formattedStudentRequests, ...formattedMentorRequests];
        
        res.json({ success: true, requests: allRequests });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// ✅ Mentor updates chat request status (Accept or Delete)
app.post("/api/chat/request/update", async (req, res) => {
    try {
        const { requestId, action } = req.body;

        if (!["accepted", "rejected"].includes(action)) {
            return res.status(400).json({ message: "Invalid action" });
        }

        const request = await ChatRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (action === "accepted") {
            // ✅ Create a chat room with participants array
            const chatRoom = new ChatRoom({
                participants: [
                    { userID: request.studentID, role: "student" },
                    { userID: request.mentorID, role: "mentor" }
                ]
            });
            await chatRoom.save();

            // ✅ Create the first message
            const initialMessage = new Message({
                chatRoomID: chatRoom._id,
                senderID: request.studentID,
                message: "Hey, I want to connect."
            });
            await initialMessage.save();

            // ✅ Delete the chat request
            await ChatRequest.findByIdAndDelete(requestId);

            return res.json({ success: true, message: "Request accepted and chat created", chatRoom });
        } 
        
        else if (action === "rejected") {
            // ✅ Simply delete the request
            await ChatRequest.findByIdAndDelete(requestId);
            return res.json({ success: true, message: "Request rejected and deleted" });
        }

    } catch (error) {
        console.error("Error updating request:", error);
        res.status(500).json({ message: "Server error", error });
    }
});


app.post("/api/chat/mentor/request/update", async (req, res) => {
    try {
        const { requestId, action } = req.body;

        if (!["accepted", "rejected"].includes(action)) {
            return res.status(400).json({ message: "Invalid action" });
        }

        const request = await MentorChatRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        if (action === "accepted") {
            // ✅ Create a chat room for mentors
            const chatRoom = new ChatRoom({
                participants: [
                    { userID: request.senderID, role: "mentor" },
                    { userID: request.receiverID, role: "mentor" }
                ]
            });
            await chatRoom.save();

            // ✅ Create an initial message
            const initialMessage = new Message({
                chatRoomID: chatRoom._id,
                senderID: request.senderID,
                message: "Hey, let's connect!"
            });
            await initialMessage.save();

            // ✅ Delete the chat request
            await MentorChatRequest.findByIdAndDelete(requestId);

            return res.json({ success: true, message: "Mentor chat request accepted and chat created", chatRoom });
        } 
        
        else if (action === "rejected") {
            // ✅ Simply delete the request
            await MentorChatRequest.findByIdAndDelete(requestId);
            return res.json({ success: true, message: "Mentor chat request rejected and deleted" });
        }

    } catch (error) {
        console.error("Error updating mentor chat request:", error);
        res.status(500).json({ message: "Server error", error });
    }
});

// ✅ API to Get Chat Rooms
app.get("/api/chat/rooms/:userID", async (req, res) => {
    try {
        const { userID } = req.params;
        const chatRooms = await ChatRoom.find({ "participants.userID": userID });

        // Fetch participant names (Mentor or Student)
        const populatedRooms = await Promise.all(
            chatRooms.map(async (room) => {
                const otherParticipant = room.participants.find(p => p.userID !== userID);

                let user;
                if (otherParticipant.role === "mentor") {
                    user = await Mentor.findById(otherParticipant.userID);
                } else {
                    user = await User.findById(otherParticipant.userID);
                }

                return {
                    chatRoomID: room._id,
                    participantName: user ? user.fullName : "Unknown",
                };
            })
        );

        res.json({ success: true, chatRooms: populatedRooms });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});

// ✅ API to Get Messages for a Chat Room
app.get("/api/chat/messages/:chatRoomID/:userID", async (req, res) => {
    try {
        const { chatRoomID, userID } = req.params;
        const messages = await Message.find({ chatRoomID }).sort({ timestamp: 1 }).select("message senderID readBy");

        // Mark messages as read for the current user
        await Message.updateMany(
            { chatRoomID, senderID: { $ne: userID }, readBy: { $ne: userID } },
            { $addToSet: { readBy: userID } }
        );

        // Reset unread message count for this user
        await ChatRoom.updateOne(
            { _id: chatRoomID, "participants.userID": userID },
            { $set: { "participants.$.unreadMessages": 0 } }
        );

        res.json({ success: true, messages });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
});




// ✅ Start Server on PORT 5002
server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
