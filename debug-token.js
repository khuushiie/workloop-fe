// Debug script to check JWT token
function decodeJWT(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Invalid token:", error);
    return null;
  }
}

// Check token from localStorage (paste in browser console)
const token = localStorage.getItem("hrms_token");
if (token) {
  console.log("Token found:", token.substring(0, 20) + "...");
  const decoded = decodeJWT(token);
  console.log("Decoded token:", decoded);

  if (decoded) {
    const now = Math.floor(Date.now() / 1000);
    const isExpired = decoded.exp < now;
    console.log("Token expired:", isExpired);
    console.log("Expires at:", new Date(decoded.exp * 1000));
    console.log("Current time:", new Date());
  }
} else {
  console.log("No token found in localStorage");
}

// Test API call
fetch("/api/attendance/regularization/my-requests", {
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
})
  .then((response) => {
    console.log("API Response status:", response.status);
    return response.json();
  })
  .then((data) => console.log("API Response data:", data))
  .catch((error) => console.error("API Error:", error));
