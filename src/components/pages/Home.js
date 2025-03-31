import React from "react";
import { Box, Grid, Typography, Button, Link, Divider } from "@mui/material";
import PhoneIphoneOutlinedIcon from "@mui/icons-material/PhoneIphoneOutlined";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import TextsmsRoundedIcon from "@mui/icons-material/TextsmsRounded";
import manImage from "../../assets/Man.png";
import girlImage from "../../assets/Girl.png";
import dotImage from "../../assets/Dot.png";
import ballImage from "../../assets/Ball.png";
import arrow1 from "../../assets/Arrow.png";
import arrow2 from "../../assets/Arrow2.png";
import redBall from "../../assets/BallRed.png";
import chatImage from "../../assets/Chat.png"
import pplImage from "../../assets/pplImage.png"
import { useNavigate } from "react-router-dom";

const CardComponent = ({ icon: Icon, title, description }) => (
  <Box
    sx={{
      textAlign: "center",
      p: 3,
      boxShadow: 3,
      backgroundColor: "#fff",
      borderRadius: 2,
      width: { xs: "90%", sm: "300px" },
    }}
  >
    <Icon sx={{ fontSize: 50, color: "primary.main", mb: 2 }} />
    <Typography variant="h6" sx={{ fontWeight: "bold", mb: 1 }}>
      {title}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {description}
    </Typography>
  </Box>
);

export default function HomePage() {
  const navigate = useNavigate();
  return (

    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        minHeight: "100vh",
        overflow: "hidden",
        textAlign: "left",
        padding: "20px",
        paddingTop: { xs: "30px", md: "50px", lg: "170px" },
      }}
    >

      {/* Top Section */}
      <Grid container spacing={4} sx={{ maxWidth: "1200px", position: "relative" }}>
        {/* Left Content */}
        <Grid
          item
          xs={12}
          md={6}
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "flex-start",
          }}
        >
          <Typography
            variant="h2"
            sx={{
              fontWeight: "bold",
              mb: 2,
              fontSize: { xs: "3rem", md: "3.5rem", lg: "4rem" },
              lineHeight: 1.2,
              fontFamily: "Courier",
            }}
          >
            Career Online Mentoring.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              fontSize: { xs: "1rem", md: "1.2rem" },
              color: "text.secondary",
            }}
          >
            We connect individuals with mentors to help them achieve their
            college and career dreams!
          </Typography>
          <Button variant="contained" color="primary" onClick={() => { navigate("/student/register") }} sx={{ mt: 3 }}>
            Find a Mentor
          </Button>
          <Typography
            variant="body2"
            sx={{
              mt: 2,
              fontSize: "0.9rem",
              color: "text.primary",
              display: "inline-block",
            }}
          >
            Looking to mentor?{" "}
            <Link
              href="/mentor/register"
              sx={{
                color: "primary.main",
                textDecoration: "none",
                "&:hover": {
                  textDecoration: "underline",
                },
              }}
            >
              Click here
            </Link>
          </Typography>
        </Grid>

        {/* Right Content (Images) */}
        <Grid item xs={12} md={6} sx={{ position: "relative" }}>
          {/* Background Ball */}
          <Box
            component="img"
            src={ballImage}
            alt="Background Ball"
            sx={{
              width: { xs: "300px", md: "500px", lg: "600px" },
              height: "auto",
              position: "absolute",
              top: "0%",
              left: "55%",
              transform: "translate(-50%, -10%)",
              zIndex: -3,
            }}
          />
          <Box
            sx={{
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "400px",
              width: "100%",
            }}
          >
            {/* Dot Image */}
            <Box
              component="img"
              src={dotImage}
              alt="Dot Overlay"
              sx={{
                width: { xs: "200px", md: "250px", lg: "300px" },
                height: "auto",
                position: "absolute",
                zIndex: 1,
                top: "50%",
                left: "52%",
                transform: "translate(-50%, -50%)",
              }}
            />
            {/* Man Image */}
            <Box
              component="img"
              src={manImage}
              alt="Man Image"
              sx={{
                width: { xs: "180px", md: "250px", lg: "300px" },
                height: "auto",
                position: "absolute",
                zIndex: 2,
                top: "35%",
                left: "30%",
                transform: "translate(-50%, -50%)",
              }}
            />
            {/* Girl Image */}
            <Box
              component="img"
              src={girlImage}
              alt="Girl Image"
              sx={{
                width: { xs: "180px", md: "250px", lg: "300px" },
                height: "auto",
                position: "absolute",
                zIndex: 2,
                top: "65%",
                left: "75%",
                transform: "translate(-50%, -50%)",
              }}
            />
          </Box>
        </Grid>
      </Grid>

      {/* New Section: Sign Up and Get Connected */}
      <Box
        sx={{
          textAlign: "center",
          mt: 10,
          mb: 5,
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mt: 10,
            fontWeight: "bold",
            fontSize: { xs: "2rem", md: "2.5rem", lg: "3rem" },
            lineHeight: 1.2,
            width: "450px",
            fontFamily: "Courier",
          }}
        >
          Sign up and Get Connected.
        </Typography>
      </Box>

      {/* Cards in Stair Layout */}
      <Box
        sx={{
          display: "flex",
          justifyContent: { xs: "center", lg: "space-between" },
          flexWrap: "wrap", // Ensure responsiveness
          gap: "20px",
          position: "relative",
          width: "85%",
          height: "400px",
          marginTop: '20px',
          marginLeft: { xs: "auto", md: "0" },
          marginRight: { xs: "30px", md: "0" },
        }}
      >
        {/* Card 1 */}
        <Box sx={{ position: "relative" }}>
          <CardComponent
            icon={PhoneIphoneOutlinedIcon}
            title="Create Account"
            description="Register & verify your mobile phone number. Get started!"
          />
        </Box>

        {/* Connector 1 */}
        <Box
          component="img"
          src={arrow1}
          alt="Arrow"
          sx={{
            width: { md: "200px" },
            height: { xs: "0px", sm: "0px", lg: "80px" },
            position: "absolute",
            top: { md: "12%", lg: '25%' },
            left: { md: "52%", lg: '33%' },
            transform: "translate(-50%, -50%)",
            zIndex: 1,
          }}
        />

        {/* Card 2 */}
        <Box sx={{ position: "relative", top: { lg: '75px' } }}>
          <CardComponent
            icon={SearchOutlinedIcon}
            title="Complete Onboarding"
            description="Tell us more about you so we can get you matched quickly!"
          />
        </Box>

        {/* Connector 2 */}
        <Box
          component="img"
          src={arrow2}
          alt="Arrow"
          sx={{
            width: { lg: "200px" },
            height: { xs: "0px", lg: "auto" },
            position: "absolute",
            top: { lg: "40%" },
            left: "70%",
            transform: "translate(-50%, -50%)",
            zIndex: 2,
          }}
        />

        {/* Card 3 */}
        <Box sx={{ position: "relative", marginTop: { xs: "5px", md: "5px" }, top: { lg: '150px' } }}>
          <CardComponent
            icon={TextsmsRoundedIcon}
            title="Get Connected"
            description="Message, call, and video call all on our platform!"
          />
        </Box>
      </Box>

      {/* Mobile image section */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          alignItems: "center",
          justifyContent: "space-between",
          px: { xs: 2, sm: 4, lg: 6 },
          width: "100%",
          height: "auto",
          backgroundColor: "#f5f5f5",
          mt: { xs: 30, md: 5 },
          py: 6,
          zIndex: -10,
          position: "relative", // Add relative positioning for redBall
        }}
      >
        {/* Left Section */}
        <Box
          sx={{
            textAlign: { xs: "left" },
            width: { xs: "100%", md: "50%" },
            px: { xs: 2, md: 20 },
            position: "relative", // Ensure redBall is positioned relative to this container
            zIndex: 2, // Content should stay above redBall
          }}
        >
          {/* Red Ball as Background */}
          <Box
            component="img"
            src={redBall}
            alt="Red Ball Background"
            sx={{
              width: { xs: "450px", sm: "500px", md: "600px" },
              height: "auto",
              position: "absolute", // Position redBall absolutely within the left section
              top: { xs: "-60px", md: "-200px" },
              left: { xs: "5px", md: "140px" },
              zIndex: -1, // Behind the text content
              opacity: 0.3, // Optional: Add transparency to make it subtle
            }}
          />

          <Typography
            variant="h4"
            sx={{
              fontWeight: "bold",
              mb: 2,
              fontSize: { xs: "1.6rem", sm: "1.8rem", md: "2rem" },
              fontFamily: "Courier",
              mt: 4,
            }}
          >
            Exchange Messages Securely.
          </Typography>
          <Typography
            variant="body1"
            sx={{
              mb: 3,
              fontSize: { xs: "0.9rem", sm: "1rem", md: "1.2rem" },
              color: "text.secondary",
            }}
          >
            When you're matched, we'll assign you a phone number that you can use
            to communicate. No app download required!
          </Typography>
        </Box>

        {/* Right Section */}
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "center",
            alignItems: "center",
            gap: { xs: 2, md: 3 },
            width: { xs: "100%", md: "50%" },
          }}
        >
          <Box
            component="img"
            src={chatImage}
            alt="Chat Image"
            sx={{
              width: { xs: "300px", sm: "320px", md: "480px" },
              height: "auto",
              position: "relative",
              zIndex: 2,
              marginTop: "10px",
              marginBottom: "20px",
            }}
          />
        </Box>
      </Box>
      {/* Get started section */}
      <Box
        sx={{
          width: "100vw",
          height: "80vh",
          backgroundImage: `url(${pplImage})`,
        }}
      >
        <Box
          sx={{
            color: "#FFFF",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "80vh",
            ml: { xs: "20px", md: "" }
          }}
        >
          <Typography sx={{ fontSize: { md: "3.5rem", xs: "2.5rem" }, fontWeight: "700", fontFamily: "courier" }}>
            It only takes a few minutes.
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate("/student/register")}
            sx={{
              padding: "1rem 2rem",
              textTransform: "capitalize",
              fontWeight: "600",
              mt: '20px'
            }}
          >
            Get started today
          </Button>
        </Box>
      </Box>

      {/* Footer Section */}
      <Box
        sx={{
          width: "100%",
          height: "100%",
          backgroundColor: "#1D293F",
          color: "#FFFFFF",
          pt: 6,
          pb: 6,
          px: { xs: 3, sm: 6, lg: 16 },
        }}
      >
        <Grid
          container
          spacing={4}
          justifyContent="center"
          sx={{
            mt: { xs: 2, sm: 6, lg: 12 },
            mb: { xs: 2, sm: 6, lg: 12 }
          }}
        >
          {/* About Career Compass */}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography
              variant="h4"
              sx={{ mb: 3, fontFamily: "Courier", color: "#F6C794" }}
            >
              Career Compass
            </Typography>
            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.8,
                fontFamily: "Courier",
                fontSize: "16px",
                color: "#CBDCEB",
              }}
            >
              We connect individuals with mentors to help them achieve their college
              and career dreams!
            </Typography>
          </Grid>

          {/* Vertical Divider */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              backgroundColor: "#CBDCEB",
              mt: 8,
              mx: 2,
              height: '120px'
            }}
          />

          {/* Main Menu */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography
              variant="h4"
              sx={{ mb: 3, fontFamily: "Courier", color: "#FFF6B3" }}
            >
              Main Menu
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, fontFamily: "Courier" }}>
              <Link href="/" sx={{ textDecoration: "none", color: "#CBDCEB" }}>
                Home
              </Link>
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, fontFamily: "Courier" }}>
              <Link href="/contact" sx={{ textDecoration: "none", color: "#CBDCEB" }}>
                Contact
              </Link>
            </Typography>
          </Grid>

          {/* Vertical Divider */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              backgroundColor: "#CBDCEB",
              mt: 8,
              mx: 2,
              height: '120px'
            }}
          />

          {/* For Users */}
          <Grid item xs={6} sm={4} md={2}>
            <Typography
              variant="h4"
              sx={{ mb: 3, fontFamily: "Courier", color: "#FFF6B3" }}
            >
              For Users
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, fontFamily: "Courier" }}>
              <Link href="student/register" sx={{ textDecoration: "none", color: "#CBDCEB" }}>
                Register
              </Link>
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, fontFamily: "Courier" }}>
              <Link href="/login" sx={{ textDecoration: "none", color: "#CBDCEB" }}>
                Login
              </Link>
            </Typography>
          </Grid>

          {/* Vertical Divider */}
          <Divider
            orientation="vertical"
            flexItem
            sx={{
              backgroundColor: "#CBDCEB",
              mt: 8,
              mx: 2,
              height: '120px'
            }}
          />

          {/* Contact Us */}
          <Grid item xs={12} sm={6} md={4} lg={3}>
            <Typography
              variant="h4"
              sx={{ mb: 3, fontFamily: "Courier", color: "#FFF6B3" }}
            >
              Contact Us
            </Typography>
            <Typography
              variant="body1"
              sx={{
                lineHeight: 1.8,
                fontFamily: "Courier",
                color: "#CBDCEB",
                mb: { xs: 2, sm: 3 },
              }}
            >
              Do you have any questions before getting started? Reach out to us!
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate("/contact")}
              sx={{
                mt: { xs: 2, sm: 3 },
                backgroundColor: "#0066FF",
                "&:hover": { backgroundColor: "#0051cc" },
                fontSize: { xs: "14px", sm: "16px" },
                padding: { xs: "6px 12px", sm: "8px 16px" },
              }}
            >
              Contact Us
            </Button>
          </Grid>
        </Grid>
      </Box>
      <Box>
      </Box>
    </Box >
  );
}
