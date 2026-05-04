import { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { supabaseAdmin } from './supabase'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== 'google') return false

      const { error } = await supabaseAdmin
        .from('users')
        .upsert(
          {
            email: user.email!,
            google_id: account.providerAccountId,
          },
          { onConflict: 'google_id' }
        )

      return !error
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        const { data } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('google_id', token.sub)
          .single()

        if (data) {
          session.user.id = data.id
        }
      }
      return session
    },
    async jwt({ token }) {
      return token
    },
  },
  pages: {
    signIn: '/login',
  },
}
