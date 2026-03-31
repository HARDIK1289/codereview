import GithubProvider from "next-auth/providers/github";
import connectDB from "@/lib/db";
import User from "@/models/User";

export const authOptions = {
  providers: [
    GithubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
      authorization: {
        params: { scope: "read:user user:email repo" }, // Request repo access
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (account.provider === "github") {
        await connectDB();
        try {
          // ✅ FIX: Always update the token, even if user exists
          const updatedUser = await User.findOneAndUpdate(
            { email: user.email },
            { 
              $set: {
                name: user.name,
                image: user.image,
                username: profile.login,
                githubId: profile.id,
                access_token: account.access_token, // <--- CRITICAL UPDATE
              }
            },
            { upsert: true, new: true } // Create if not exists
          );
          
          return true;
        } catch (error) {
          console.error("Error saving user to DB:", error);
          return false;
        }
      }
      return true;
    },

    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },

    async session({ session, token }) {
      await connectDB();
      // Fetch the user ID from DB to ensure it matches the backend's lookup
      const dbUser = await User.findOne({ email: session.user.email });
      
      if (dbUser) {
        session.user.id = dbUser._id.toString();
        session.user.username = dbUser.username;
        session.accessToken = token.accessToken;
      }
      return session;
    },
  },
};