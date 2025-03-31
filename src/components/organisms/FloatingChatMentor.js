    import React, { useState, useEffect, useRef } from "react";
    import { Box, IconButton, Paper, Typography, TextField, Button, List, ListItem, ListItemText,Badge } from "@mui/material";
    import ChatIcon from "@mui/icons-material/Chat";
    import CloseIcon from "@mui/icons-material/Close";
    import SendIcon from "@mui/icons-material/Send";
    import { io } from "socket.io-client";
    import axios from "axios";
    import Picker from "emoji-picker-react";
    import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";

    const SOCKET_URL = "http://localhost:5002";
    const API_URL = "http://localhost:5002/api/chat";

    const FloatingChat = () => {
        const [open, setOpen] = useState(false);
        const [chatRooms, setChatRooms] = useState([]);
        const [currentRoom, setCurrentRoom] = useState(null);
        const [messages, setMessages] = useState([]);
        const [input, setInput] = useState("");
        const [showEmojiPicker, setShowEmojiPicker] = useState(false);
        const [unreadCounts, setUnreadCounts] = useState({});
        const socket = useRef(null);
        const emojiPickerRef = useRef(null);

        const isMentor = localStorage.getItem("mid");
        const isUser = localStorage.getItem("id");
        const userID = isMentor ? isMentor : isUser;

        // Fetch chat rooms
        useEffect(() => {
            const fetchRooms = async () => {
                try {
                    const res = await axios.get(`${API_URL}/rooms/${userID}`);
                    setChatRooms(res.data.chatRooms || []);
                    console.log(res.data.chatRooms)
                } catch (err) {
                    console.error("Error fetching chat rooms:", err);
                }
            };
            if (userID) fetchRooms();
        }, [userID]);

        useEffect(() => {
            if (currentRoom) {
                socket.current.emit("joinRoom", currentRoom.chatRoomID);
            }
        }, [currentRoom]);

        const messagesEndRef = useRef(null);

        useEffect(() => {
            // Scroll to the bottom whenever messages update
            if (messagesEndRef.current) {
                messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
            }
        }, [messages]);

        // Initialize socket connection
        // useEffect(() => {
        //     socket.current = io(SOCKET_URL, {
        //         transports: ["websocket"],
        //         reconnection: true,
        //     });

        //     socket.current.on("messageUpdate", (updatedMessages) => {
        //         if (currentRoom && updatedMessages[0]?.chatRoomID === currentRoom.chatRoomID) {
        //             setMessages(updatedMessages);
        //         }
        //     });

        //     return () => {
        //         socket.current.disconnect();
        //     };
        // }, [currentRoom]);

        useEffect(() => {
            socket.current = io(SOCKET_URL, { transports: ["websocket"], reconnection: true });
    
            socket.current.on("messageUpdate", (updatedMessages) => {
                setMessages((prevMessages) => {
                    if (updatedMessages.length > 0 && updatedMessages[0].chatRoomID === currentRoom?.chatRoomID) {
                        return updatedMessages;
                    }
                    return prevMessages;
                });
            });
    
            socket.current.on("unreadCountUpdate", (updatedCounts) => {
                console.log(updatedCounts)
                const newUnreadCounts = {
                    [updatedCounts.chatRoomID]: updatedCounts.unreadMessages
                        .filter(user => user.userID !== userID) // Exclude the specific userID
                        .reduce((acc, user) => acc + user.unreadMessages, 0) // Sum unread messages
                };
            
                setUnreadCounts(newUnreadCounts);
            });
    
            return () => {
                socket.current.disconnect();
            };
        }, []); 

        // Join chat room & fetch messages
        const handleSelectRoom = async (room) => {
            setCurrentRoom(room);
            socket.current.emit("joinRoom", room.chatRoomID);
    
            try {
                const res = await axios.get(`${API_URL}/messages/${room.chatRoomID}/${userID}`);
                setMessages(res.data.messages || []);
                setUnreadCounts((prev) => ({ ...prev, [room.chatRoomID]: 0 })); // Reset unread count for this room
            } catch (err) {
                console.error("Error fetching messages:", err);
            }
        };

        // Send message
        const handleSendMessage = () => {
            if (!input.trim() || !currentRoom) return;

            const messageData = { chatRoomID: currentRoom.chatRoomID, senderID: userID, message: input };
            socket.current.emit("sendMessage", messageData);

            setMessages((prev) => [...prev, messageData]); // Optimistically update UI
            setInput("");
        };

        const handleEmojiClick = (emojiData) => {
            setInput((prevInput) => prevInput + emojiData.emoji);
        };

        const handleClickOutside = (event) => {
            if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };

        const totalUnread = Object.values(unreadCounts).reduce((acc, count) => acc + count, 0);
        return (
            <Box sx={{ position: "fixed", bottom: 20, right: 20, zIndex: 1000 }}>
                {!open && (
                    <IconButton
                        onClick={() => setOpen(true)}
                        sx={{
                            backgroundColor: "#0288d1",
                            color: "white",
                            width: 56,
                            height: 56,
                            "&:hover": { backgroundColor: "#0277bd" },
                        }}
                    >
                        <Badge badgeContent={totalUnread} color="error"></Badge>
                        <ChatIcon />
                    </IconButton>
                )}

                {open && (
                    <Paper
                        elevation={3}
                        sx={{
                            width: 470,
                            height: 500,
                            position: "fixed",
                            bottom: 80,
                            right: 20,
                            p: 2,
                            display: "flex",
                            flexDirection: "row",
                            bgcolor: "#FBF5DD",
                            borderRadius: "8px",
                            boxShadow: "rgba(0, 0, 0, 0.2) 0px 4px 6px",
                        }}
                    >
                        {/* Chat Rooms Sidebar */}
                        <Box sx={{ width: 180, height: "100%", bgcolor: "#FBF5DD", borderRadius: "8px", overflowY: "auto" }}>
                        <Typography variant="h6" sx={{ textAlign: "center", mt: 1 }}>
                            Chats
                        </Typography>
                        <List>
                            {chatRooms.map((room) => (
                                <ListItem
                                    key={room.chatRoomID}
                                    button
                                    selected={currentRoom?.chatRoomID === room.chatRoomID}
                                    onClick={() => handleSelectRoom(room)}
                                    sx={{
                                        backgroundColor:
                                            currentRoom?.chatRoomID === room.chatRoomID ? "#0288d1" : "transparent",
                                        color: currentRoom?.chatRoomID === room.chatRoomID ? "white" : "black",
                                        "&:hover": { backgroundColor: "#0288d1", color: "white" },
                                    }}
                                >
                                    <ListItemText primary={room.participantName} />
                                    <Badge badgeContent={unreadCounts[room.chatRoomID] || 0} color="primary" sx={{ ml: 1 }} />
                                </ListItem>
                            ))}
                        </List>
                    </Box>

                        {/* Chat Window */}
                        <Box sx={{ flexGrow: 1, display: "flex", flexDirection: "column", pl: 1 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    borderBottom: "1px solid #ccc",
                                    pb: 1,
                                    mb: 1,
                                }}
                            >
                                <Typography variant="h6">
                                    {currentRoom ? currentRoom.participantName : "Select a chat"}
                                </Typography>
                                <IconButton onClick={() => setOpen(false)}>
                                    <CloseIcon />
                                </IconButton>
                            </Box>

                            {/* Messages */}
                            <Box
                                ref={messagesEndRef} // 👈 Ref to track the last message
                                sx={{
                                    flexGrow: 1,
                                    overflowY: "auto",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1,
                                    p: 1,
                                    maxHeight: "350px",
                                    bgcolor: "#EEE",
                                    borderRadius: "8px",
                                    boxShadow: 2,
                                    scrollbarWidth: "none", // 👈 Hides scrollbar for Firefox
                                    "&::-webkit-scrollbar": { display: "none" }, // 👈 Hides scrollbar for Chrome/Safari
                                }}
                            >
                                {messages.map((msg, index) => (
                                    <Box
                                        key={index}
                                        sx={{
                                            alignSelf: msg.senderID === userID ? "flex-end" : "flex-start",
                                            backgroundColor: msg.senderID === userID ? "#A3D8FF" : "#FFE6C9",
                                            color: "#333",
                                            p: 1.2,
                                            borderRadius: "8px",
                                            maxWidth: "75%",
                                            fontSize: "14px",
                                            boxShadow: 1,
                                        }}
                                    >
                                        {msg.message}
                                    </Box>
                                ))}
                            </Box>

                            {/* Message Input */}
                            <Box sx={{ display: "flex", gap: 1, mt: 1, position: "relative" }}>
                                <IconButton onClick={() => setShowEmojiPicker((prev) => !prev)}>
                                    <EmojiEmotionsIcon />
                                </IconButton>
                                {showEmojiPicker && (
                                    <Box ref={emojiPickerRef} sx={{ position: "absolute", bottom: 40, left: 0, zIndex: 10 }}>
                                        <Picker onEmojiClick={handleEmojiClick} />
                                    </Box>
                                )}
                                <TextField fullWidth variant="outlined" size="small" placeholder="Type a message..." value={input} onChange={(e) => setInput(e.target.value)} onKeyPress={(e) => e.key === "Enter" && handleSendMessage()} sx={{ bgcolor: "white", borderRadius: "8px" }} disabled={!currentRoom} />
                                <Button variant="contained" color="primary" onClick={handleSendMessage} sx={{ borderRadius: "8px" }} disabled={!currentRoom}>
                                    <SendIcon />
                                </Button>
                            </Box>
                        </Box>
                    </Paper>
                )}
            </Box>
        );
    };

    export default FloatingChat;
