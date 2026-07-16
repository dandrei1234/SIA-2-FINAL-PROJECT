const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1" || window.location.hostname.startsWith("192.168.");

export const API_URL = isLocalhost 
  ? `http://${window.location.hostname}:1337/api` 
  : "https://sia-2-final-project.onrender.com/api";
