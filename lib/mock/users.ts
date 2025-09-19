import type { User } from "@/lib/types"

export const mockUsers: User[] = [
  {
    id: "user1",
    name: "Alex Chen",
    email: "alex@gamedev.com",
    avatar_url: "/developer-avatar.png",
  },
  {
    id: "user2",
    name: "Sarah Kim",
    email: "sarah@gamedev.com",
    avatar_url: "/artist-avatar.png",
  },
]

export async function getCurrentUser(): Promise<User> {
  await new Promise((resolve) => setTimeout(resolve, 200))
  return mockUsers[0] // Mock current user
}

export function getUserById(id: string): User | undefined {
  return mockUsers.find((user) => user.id === id)
}
