export default {
    cookieName: "mongo_auth_cookie",
    password: process.env.IRON_PASS,
    cookieOptions: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000
    },
  }