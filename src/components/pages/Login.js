import React, { useState, useEffect, useRef } from "react";
import { Box, Button, TextField, Typography, Link, Alert, CircularProgress } from "@mui/material";
import AcUnitIcon from "@mui/icons-material/AcUnit"; 
import axios from "axios"; // Import axios for API calls
import { useNavigate } from "react-router-dom"; // To navigate after login

const usnRegex = /^1BG\d{2}(CS|IS|AI|ME|EE|EC)\d{3}$/;

export default function SignInPage() {
    const [usn, setUsn] = useState("");
    const [password, setPassword] = useState("");
    const [usnError, setUsnError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const usnRef = useRef(null);
    const passwordRef = useRef(null);
    const navigate = useNavigate(); // For navigation

    useEffect(() => {
        if (usnRef.current) {
            usnRef.current.focus();
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setUsnError("");
        setPasswordError("");
        setErrorMessage("");
        setLoading(true);

        if (!usn) {
            setUsnError("USN is required.");
            usnRef.current.focus();
            setLoading(false);
            return;
        } else if (!usnRegex.test(usn)) {
            setUsnError("Please enter a valid USN (e.g., 1BG21CS001).");
            usnRef.current.focus();
            setLoading(false);
            return;
        }

        if (!password) {
            setPasswordError("Password is required.");
            passwordRef.current.focus();
            setLoading(false);
            return;
        } else if (password.length < 6) {
            setPasswordError("Password must be at least 6 characters.");
            passwordRef.current.focus();
            setLoading(false);
            return;
        }

        try {
            // Send login request to backend
            const response = await axios.post("http://localhost:5002/api/student/login", { usn, password });

            if (response.data.success) {
                
                console.log(response.data)
                localStorage.setItem("studentToken", response.data.token); // Store token
                localStorage.setItem("usn", usn);
                localStorage.setItem("id", response.data.student._id)
                navigate("/dashboard"); // Redirect to dashboard
            } else {
                setErrorMessage("Invalid USN or Password. Please try again.");
            }
        } catch (error) {
            setErrorMessage("Login failed. Check your credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                background: "linear-gradient(to bottom, #f5f5f5 50%, #000 50%)",
                px: 2
            }}
        >
            <Box
                sx={{
                    width: { xs: "100%", sm: "80%", md: "50%", lg: "40%" },
                    maxWidth: 450,
                    backgroundColor: "#F8FAFC",
                    borderRadius: 3,
                    boxShadow: 3,
                    padding: { xs: 3, sm: 4, md: 5 }
                }}
            >
                <Box sx={{ textAlign: "center", mb: 4 }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, mb: 2 }}>
                        <AcUnitIcon sx={{ fontSize: 40, color: "black.main" }} />
                        <Typography variant="h5" fontWeight="bold" sx={{ fontSize: { xs: "1.5rem", sm: "1.8rem" }, fontFamily: "Courier" }}>
                            Career Compass
                        </Typography>
                    </Box>
                    <Typography variant="h6" fontWeight="bold" sx={{ mb: 1, fontSize: { xs: "1rem", sm: "1.2rem" } }}>
                        Account Login
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Enter your account info below:
                    </Typography>
                </Box>

                {errorMessage && <Alert severity="error" sx={{ mb: 2 }}>{errorMessage}</Alert>}

                <Box sx={{ backgroundColor: "#fff", borderRadius: 2, boxShadow: 1, padding: { xs: 2, sm: 4 }, mb: 3 }}>
                    <Box sx={{ mb: 3 }}>
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            label="USN"
                            placeholder="1BG21CS001"
                            value={usn}
                            onChange={(e) => setUsn(e.target.value)}
                            error={Boolean(usnError)}
                            helperText={usnError}
                            sx={{
                                mb: 4,
                                mt: 3,
                                "& .MuiOutlinedInput-root": { borderRadius: "12px", backgroundColor: "#fff" }
                            }}
                            inputRef={usnRef}
                        />
                        <TextField
                            fullWidth
                            variant="outlined"
                            size="small"
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            error={Boolean(passwordError)}
                            helperText={passwordError}
                            sx={{
                                mt: 1,
                                "& .MuiOutlinedInput-root": { borderRadius: "12px", backgroundColor: "#fff" }
                            }}
                            inputRef={passwordRef}
                        />
                    </Box>

                    <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{
                            textTransform: "capitalize",
                            mb: 2,
                            py: { xs: 1, sm: 1.5 },
                            background: "#FFA928",
                            fontWeight: "bold"
                        }}
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? <CircularProgress size={24} sx={{ color: "#fff" }} /> : "Sign In"}
                    </Button>

                    <Box sx={{ textAlign: "center" }}>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1, fontSize: { xs: "0.85rem", sm: "0.95rem" } }}
                        >
                            <Link href="/student/register" underline="hover" color="primary">
                                Create Student Account
                            </Link>
                            <br />
                            <Link href="/mentor-login" underline="hover" color="primary">
                                Mentor Login
                            </Link>
                        </Typography>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
}
