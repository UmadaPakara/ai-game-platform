export interface Profile {
  id: string
  username: string
  bio?: string
  avatar_url?: string
}

export interface Game {
  id: string
  title: string
  description?: string
  html_code: string
  thumbnail?: string
  user_id: string
  likes: number
  views: number
  created_at: string
  profiles?: {
    username: string
  }
}

export interface Comment {
  id: string
  game_id: string
  user_id?: string
  content: string
  created_at: string
}
