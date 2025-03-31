import React, { useState } from "react";
import { Box, Button, Grid, TextField, Typography } from "@mui/material";
import BgContact from "../../assets/BgContact.png";

export default function ContactUsPage() {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        subject: "",
        content: "",
    });

    const [errors, setErrors] = useState({
        name: "",
        email: "",
        subject: "",
        content: "",
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        let validationErrors = {};

        // Name validation
        if (!formData.name) validationErrors.name = "Name is required";

        // Email validation (must contain "@" and end with @bnmit.in or any other word after "@")
        const emailRegex = /^[^\s@]+@([a-zA-Z0-9]+)\.bnmit\.in$/;
        if (!formData.email) {
            validationErrors.email = "Email is required";
        } else if (!emailRegex.test(formData.email)) {
            validationErrors.email = "Please enter a valid email address (must contain @bnmit.in)";
        }

        // Subject validation (must not contain any whitespace)
        if (!formData.subject) {
            validationErrors.subject = "Subject is required";
        } else if (/\s/.test(formData.subject)) {
            validationErrors.subject = "Subject must not contain whitespace";
        }

        // Message validation (must not be empty or contain only spaces)
        if (!formData.content) {
            validationErrors.content = "Message is required";
        } else if (!formData.content.trim()) {
            validationErrors.content = "Message cannot be empty or only contain spaces";
        }

        setErrors(validationErrors);

        // If no errors, proceed with form submission
        if (Object.keys(validationErrors).length === 0) {
            console.log("Form submitted", formData);
            // You can handle form submission here (e.g., send the data to the server)
        }
    };

    return (
        <Box
            sx={{
                backgroundSize: "cover",
                backgroundImage: `url(${BgContact})`,
                backgroundPosition: "center",
                minHeight: "85vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: 2,
            }}
        >
            <Grid
                container
                justifyContent="center"
                alignItems="center"
                spacing={2}
                sx={{ width: "100%", maxWidth: "1200px", margin: "0 auto" }}
            >
                <Grid
                    item
                    xs={12}
                    sm={10}
                    md={8}
                    lg={6}
                    sx={{
                        padding: { xs: 2, sm: 4 },
                        backgroundColor: "#F8FAFC",
                        borderRadius: 2,
                        boxShadow: 3,
                    }}
                >
                    {/* Header */}
                    <Box sx={{ textAlign: "center", mb: 3, ml: '12px' }}>
                        <Typography
                            variant="h3"
                            fontWeight="bold"
                            fontFamily="Courier"
                            sx={{ fontSize: { xs: "1.8rem", md: "2.5rem" } }}
                        >
                            Contact Us
                        </Typography>
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            fontFamily="Gilroy"
                            sx={{ fontSize: { xs: "0.9rem", md: "1.2rem" } }}
                        >
                            Send us a message & we'll get back to you ASAP.
                        </Typography>
                    </Box>

                    {/* Form */}
                    <Box component="form" sx={{ width: "100%", ml: '7px' }} onSubmit={handleSubmit}>
                        {/* Name */}
                        <Box sx={{ mb: 3, mr: {xs: 2, md: 0} }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Name"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                error={Boolean(errors.name)}
                                helperText={errors.name}
                            />
                        </Box>
                        {/* Email */}
                        <Box sx={{ mb: 3, mr: {xs: 2, md: 0} }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                error={Boolean(errors.email)}
                                helperText={errors.email}
                            />
                        </Box>
                        {/* Subject */}
                        <Box sx={{ mb: 3, mr: {xs: 2, md: 0} }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                error={Boolean(errors.subject)}
                                helperText={errors.subject}
                            />
                        </Box>
                        {/* Message */}
                        <Box sx={{ mb: 3, mr: {xs: 2, md: 0} }}>
                            <TextField
                                fullWidth
                                variant="outlined"
                                label="Message"
                                name="content"
                                value={formData.content}
                                onChange={handleInputChange}
                                error={Boolean(errors.content)}
                                helperText={errors.content}
                                multiline
                                rows={4}
                            />
                        </Box>
                        {/* Submit Button */}
                        <Box sx={{ textAlign: "center", mr: {xs: 2, md: 0} }}>
                            <Button
                                variant="contained"
                                color="primary"
                                type="submit"
                                sx={{
                                    width: "100%",
                                    padding: { xs: "0.6rem", sm: "0.8rem" },
                                    fontSize: { xs: "0.8rem", sm: "1rem" },
                                }}
                            >
                                Submit
                            </Button>
                        </Box>
                    </Box>
                </Grid>
            </Grid>
        </Box>
    );
}
