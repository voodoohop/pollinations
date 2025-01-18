export const galleryContainerStyle = {
  minHeight: "100vh",
  backgroundColor: "transparent",
  color: "#fff",
  fontFamily: "'Space Mono', monospace",
  position: "relative",
  overflow: "hidden",
  zIndex: "1",
};

export const headerStyle = {
  textAlign: "left",
  fontSize: "4.5rem",
  marginBottom: "10px",
  color: "#fff",
  fontFamily: "'Space Mono', monospace",
  fontWeight: "700",
  letterSpacing: "-2px",
  textTransform: "uppercase",
  animation: "glitch 4s infinite",
  position: "relative",
  paddingLeft: "20px",
  borderLeft: "4px solid #0ff",
  textShadow: "0 0 10px rgba(255, 215, 0, 0.3), 0 0 20px rgba(255, 215, 0, 0.2)",
  "&::after": {
    content: '"💎"',
    position: "absolute",
    right: "20px",
    fontSize: "3rem",
    opacity: "0.2",
    animation: "float 3s ease-in-out infinite",
  }
};

export const subHeaderStyle = {
  display: "block",
  textAlign: "left",
  marginBottom: "40px",
  color: "#999",
  fontSize: "1.1rem",
  fontFamily: "'Space Mono', monospace",
  letterSpacing: "1px",
  paddingLeft: "24px",
  position: "relative",
  textShadow: "0 0 5px rgba(255, 215, 0, 0.2)",
};

export const paypalStyle = {
  display: "block",
  textAlign: "center",
  padding: "15px 30px",
  margin: "30px auto",
  background: "repeating-linear-gradient(45deg, #000, #000 10px, #0ff 10px, #0ff 20px)",
  border: "3px double #0ff",
  color: "#fff",
  textDecoration: "none",
  fontFamily: "'Comic Sans MS', cursive, 'Space Mono', monospace",
  letterSpacing: "2px",
  fontSize: "1.2rem",
  position: "relative",
  transition: "all 0.3s ease",
  maxWidth: "400px",
  cursor: "pointer",
  animation: "blink 1s infinite",
  textShadow: "2px 2px #000, -2px -2px #0ff",
  "&:hover": {
    transform: "rotate(2deg)",
    animation: "rainbow 0.5s infinite",
  },
  "&::before": {
    content: '"🌟"',
    position: "absolute",
    left: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "1.2rem",
  },
  "&::after": {
    content: '"🌟"',
    position: "absolute",
    right: "20px",
    top: "50%",
    transform: "translateY(-50%)",
    fontSize: "1.2rem",
  },
};

export const docaLogoStyle = {
  position: "fixed",
  top: "0",
  left: "0",
  width: "100vw",
  height: "100vh",
  objectFit: "cover",
  opacity: "0.15",
  filter: "drop-shadow(0 0 20px #0ff)",
  pointerEvents: "none",
  zIndex: "-1",
};

export const galleryStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "6rem",
  justifyContent: "center",
  width: "100%",
  maxWidth: "1600px",
  margin: "0 auto",
  position: "relative",
  "&::before": {
    content: "''",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: "2px",
    background: "rgba(0, 255, 255, 0.2)",
    animation: "scanline 8s linear infinite",
  },
};

export const itemStyle = {
  width: "100%",
  transform: "scale(1)",
  transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
  position: "relative",
  "&:hover": {
    transform: "scale(1.02) translateY(-5px)",
    zIndex: 2,
    boxShadow: "0 0 30px rgba(255, 215, 0, 0.05)", // subtle gold glow on hover
  },
  "&::before": {
    content: "''",
    position: "absolute",
    top: "-20px",
    left: "0",
    width: "40px",
    height: "2px",
    background: "linear-gradient(90deg, #0ff, rgba(255, 215, 0, 0.3))",
  },
};

export const captionStyle = {
  fontSize: "0.9rem",
  lineHeight: "1.4",
  marginTop: "15px",
  color: "#999",
  maxWidth: "960px",
  fontFamily: "'Space Mono', monospace",
  letterSpacing: "1px",
  borderLeft: "2px solid #0ff",
  paddingLeft: "15px",
  background: "rgba(0, 0, 0, 0.7)",
};

export const loadingStyle = {
  fontSize: "2rem",
  textAlign: "center",
  marginTop: "50px",
  color: "#0ff",
  fontFamily: "'Space Mono', monospace",
  letterSpacing: "4px",
  animation: "glitch 2s infinite",
};

export const docaBlingStyle = {
  width: "300px",
  height: "auto",
  margin: "20px auto",
  display: "block",
  filter: "drop-shadow(0 0 15px #0ff) invert(1)",
  mixBlendMode: "screen",
  opacity: "0.8",
};

// Add luxury mockery keyframes
const berlinKeyframes = `
  @import url('https://fonts.googleapis.com/css2?family=Space+Mono:wght@400;700&display=swap');

  @keyframes float {
    0% { transform: rotate(0deg) translateY(0); }
    25% { transform: rotate(2deg) translateY(-5px); }
    75% { transform: rotate(-2deg) translateY(5px); }
    100% { transform: rotate(0deg) translateY(0); }
  }

  @keyframes rainbow {
    0% { background: #ff0000; }
    20% { background: #ff00ff; }
    40% { background: #0000ff; }
    60% { background: #00ffff; }
    80% { background: #00ff00; }
    100% { background: #ff0000; }
  }

  @keyframes blink {
    0%, 49% { opacity: 1; }
    50%, 100% { opacity: 0.7; }
  }

  @keyframes glitch {
    0% {
      transform: translate(0);
      text-shadow: -2px 0 #0ff, 2px 2px #f0f;
    }
    25% {
      transform: translate(-2px, 2px);
      text-shadow: 2px -2px #0ff, -2px 2px #f0f;
    }
    50% {
      transform: translate(2px, -2px);
      text-shadow: -2px 2px #0ff, 2px -2px #f0f;
    }
    75% {
      transform: translate(-2px, -2px);
      text-shadow: 2px 2px #0ff, -2px -2px #f0f;
    }
    100% {
      transform: translate(0);
      text-shadow: -2px 0 #0ff, 2px 2px #f0f;
    }
  }

  .vip-badge {
    position: fixed;
    top: 20px;
    right: 20px;
    font-size: 1rem;
    color: #0ff;
    background: #000;
    padding: 10px 20px;
    animation: float 4s ease-in-out infinite;
    text-transform: uppercase;
    letter-spacing: 2px;
    font-weight: bold;
    pointer-events: none;
    border: 2px solid #0ff;
    box-shadow: 0 0 15px #0ff;
    &::before {
      content: '🌌';
      margin-right: 8px;
    }
    &::after {
      content: '👽';
      margin-left: 8px;
    }
  }
`;

// Add the keyframes to the document
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = berlinKeyframes;
document.head.appendChild(styleSheet);
