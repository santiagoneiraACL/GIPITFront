import type { AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import AzureADProvider from "next-auth/providers/azure-ad";

interface Management {
  id: number;
  name: string;
  company: {
    id: number;
    name: string;
  };
}

export const authOptions: AuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    AzureADProvider({
      clientId: process.env.AZURE_AD_CLIENT_ID as string,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET as string,
      tenantId: process.env.AZURE_AD_TENANT_ID,
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/byEmail/${user.email}`
        );
        const userInfo = await response.json();

        console.log("User role from DB:", userInfo.roles.nombre); // Para debug
        console.log("User name:", userInfo.name); // Para debug

        if (!userInfo || !userInfo.roles.nombre) {
          return false;
        }

        // if (!userInfo.is_active) {
        //   console.error("El usuario está inactivo.");
        //   return false;
        // }

        const managementResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/users/management/${userInfo.id}`
        );
        const managementInfo = await managementResponse.json();

        user.id = userInfo.id;
        user.role = userInfo.roles.nombre;
        user.position = userInfo.position;
        user.managements = managementInfo.map(
          (um: { management: Management }) => ({
            id: um.management.id,
            name: um.management.name,
            company: {
              id: um.management.company.id,
              name: um.management.company.name,
            },
          })
        );

        return true;
      } catch (error) {
        console.error("Error verificando el usuario:", error);
        return false;
      }
    },
    async jwt({ token, user }) {
      if (user) {
        console.log("User role in JWT:", user.role);
        token.id = user.id;
        token.role = user.role;
        token.position = user.position;
        token.managements = user.managements;
      }
      return token;
    },
    async session({ token, session }) {
      session.user.id = token.id as number;
      if (typeof token.role === "string") {
        session.user.role = token.role;
      } else {
        session.user.role = undefined;
      }
      if (typeof token.position === "string") {
        session.user.position = token.position;
      } else {
        session.user.position = undefined;
      }

      session.user.managements = (token.managements as Management[]) || [];

      return session;
    },
    async redirect({ baseUrl }) {
      return baseUrl;
    },
  },
};
