import 'next-auth'

declare module 'next-auth' {
  interface User {
    id: string
    username: string
    nickname: string
    role: string
  }

  interface Session {
    user: {
      id: string
      username: string
      nickname: string
      role: string
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    username: string
    nickname: string
    role: string
  }
}

