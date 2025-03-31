import React , {useState, useEffect} from "react";
import { Box, Typography, Divider, Card, CardContent, Grid, IconButton } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle"; // Tick icon
import CancelIcon from "@mui/icons-material/Cancel"; // Cross icon

export default function MentorTrainingPage() {
    // Array of student details
    const [trainingModules, setTrainingModules] = useState([]); // ✅ Use state to store fetched data

    const mentorID = localStorage.getItem("mid");

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await fetch(`http://localhost:5002/api/chat/requests/${mentorID}`);
                const data = await response.json();
                if (data.success) {
                    setTrainingModules(data.requests); // ✅ Update state instead of modifying a variable
                }
            } catch (error) {
                console.error("Error fetching chat requests:", error);
            }
        };

        fetchRequests(); // Fetch initially

        // Set interval to fetch every 3 seconds
        const interval = setInterval(fetchRequests, 3000);

        return () => clearInterval(interval); // Cleanup on unmount
    }, [mentorID]);

    const handleAccept = async (id, type) => {
        try {
            const url = type === "mentor" 
                ? "http://localhost:5002/api/chat/mentor/request/update" 
                : "http://localhost:5002/api/chat/request/update";
    
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ requestId: id, action: "accepted" }),
            });
    
            const data = await response.json();
            if (data.success) {
                setTrainingModules(prevModules => prevModules.filter(module => module.id !== id));
                window.location.reload(); // Refresh the page after success for the new chatrooms to appear
            }
        } catch (error) {
            console.error("Error accepting request:", error);
        }
    };;
    
    const handleReject = async (id, type) => {
        try {
            const url = type === "mentor" 
                ? "http://localhost:5002/api/chat/mentor/request/update" 
                : "http://localhost:5002/api/chat/request/update";
    
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ requestId: id, action: "rejected" }),
            });
    
            const data = await response.json();
            if (data.success) {
                setTrainingModules(prevModules => prevModules.filter(module => module.id !== id));
            }
        } catch (error) {
            console.error("Error rejecting request:", error);
        }
    };




    return (
        <Box
            sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                p: 4,
            }}
        >
            <Box
                sx={{
                    width: { xs: "100%", sm: "80%", md: "70%", lg: "100%" },
                    height: '50%',
                }}
            >
                {/* Heading */}
                <Typography variant="h4" fontWeight="bold" sx={{ mb: 2, mt: 4, fontFamily: 'Courier', textAlign: "center" }}>
                    Mentor Training
                </Typography>

                {/* Subheading */}
                <Box sx={{ width: '100%' }}>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3, fontFamily: 'Gilroy', textAlign: "center" }}>
                        The below optional training modules provide additional information about what is expected of you as
                        a mentor and what you can expect from Career Compass; the tools and resources available to you as a Career Compass
                        mentor; and other helpful information to make your mentoring experience a success!
                    </Typography>
                </Box>

                {/* Divider */}
                <Divider sx={{ mb: 3 }} />

                {/* Cards Section */}
                <Grid container spacing={4} justifyContent={'center'} alignItems={'stretch'}>
                    {trainingModules.map((module, index) => (
                        <Grid item xs={12} sm={6} md={4} key={index}>
                            <Card
                                sx={{
                                    height: "auto",
                                    display: "flex",
                                    flexDirection: "column",
                                    boxShadow: 3,
                                    borderRadius: 2,
                                    justifyContent: "space-between",
                                }}
                            >
                                {/* Content */}
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                        gutterBottom
                                        sx={{ textAlign: "center", fontSize: 16, fontFamily: "courier" }}
                                    >
                                        {module.title}
                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "justify", fontSize: 14, fontFamily: 'gilroy' }}>
                                       {module.type === "mentor" ? "mentorID :" : "usn :"} {module.description}

                                    </Typography>
                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "justify", fontSize: 14, fontFamily: 'gilroy' }}>
                                       email : {module.mail}

                                    </Typography>
                                </CardContent>

                                {/* Action Buttons */}
                                <Box sx={{ display: "flex", justifyContent: "space-around", p: 2 }}>
                                    <IconButton
                                        color="primary"
                                        onClick={() => handleAccept(module.id, module.type)}
                                        sx={{ bgcolor: "lightblue", "&:hover": { bgcolor: "blue", color: "white" } }}
                                    >
                                        <CheckCircleIcon />
                                    </IconButton>
                                    <IconButton
                                        color="error"
                                        onClick={() => handleReject(module.id, module.type)}
                                        sx={{ bgcolor: "lightcoral", "&:hover": { bgcolor: "red", color: "white" } }}
                                    >
                                        <CancelIcon />
                                    </IconButton>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            </Box>
        </Box>
    );
}
