export default {
    cookieName: "mongo_auth_cookie",
    password: process.env.IRON_PASS,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
    },
  }