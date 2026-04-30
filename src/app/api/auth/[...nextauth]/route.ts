import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "البريد الإلكتروني", type: "email" },
        password: { label: "كلمة المرور", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // البحث عن المستخدم في قاعدة البيانات
        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user) throw new Error("لا يوجد مستخدم بهذا البريد");

        // التأكد من أن الحساب مفعّل من قبلك (المدير)
        if (!user.isActivated) {
          throw new Error("حسابك قيد المراجعة، يرجى التواصل مع الإدارة للتفعيل");
        }

        // مطابقة كلمة المرور
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) throw new Error("كلمة المرور خاطئة");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role
        };
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).role = token.role;
        (session.user as any).id = token.id;
      }
      return session;
    }
  },
  pages: {
    signIn: "/auth/signin", // الصفحة التي سننشئها لاحقاً
  },
  secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };
