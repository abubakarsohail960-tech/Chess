# Chess

Online chess with **ELO ratings**, **friends**, **private rooms**, **login/register**, and **animated** piece moves. Built for [Vercel](https://vercel.com) deployment.

## Features

- **Auth** — Register, login, logout with secure password hashing (bcrypt)
- **Account** — Update username and password
- **ELO** — Standard K=32 rating updates after each rated game
- **Friends** — Send/accept friend requests by username
- **Rooms** — Create a room with a 6-character code or join a friend's room
- **Live play** — Real-time sync via polling (Vercel-friendly, no WebSockets required)
- **Animations** — Framer Motion + react-chessboard move animations

## Tech Stack

- [Next.js 15](https://nextjs.org) (App Router)
- [Prisma](https://www.prisma.io) + PostgreSQL
- [chess.js](https://github.com/jhlywa/chess.js) + [react-chessboard](https://github.com/Clariity/react-chessboard)
- [Framer Motion](https://www.framer.com/motion/)

## Local Setup

1. **Clone the repo**

   ```bash
   git clone https://github.com/YOUR_USERNAME/Chess.git
   cd Chess
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Environment variables**

   Copy `.env.example` to `.env`:

   ```bash
   cp .env.example .env
   ```

   Set:

   - `DATABASE_URL` — PostgreSQL connection string ([Neon](https://neon.tech), [Supabase](https://supabase.com), or [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres))
   - `JWT_SECRET` — Random secret (`openssl rand -base64 32`)
   - `NEXT_PUBLIC_APP_URL` — `http://localhost:3000` for local dev

4. **Push database schema**

   ```bash
   npx prisma db push
   ```

5. **Run dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

## Deploy to Vercel

1. Push this project to GitHub as a repo named **Chess**.
2. Go to [vercel.com/new](https://vercel.com/new) and import the **Chess** repository.
3. Add environment variables in Vercel project settings:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `NEXT_PUBLIC_APP_URL` — your production URL (e.g. `https://chess.vercel.app`)
4. Deploy. Vercel runs `prisma generate && next build` automatically.

After first deploy, run migrations against production:

```bash
npx prisma db push
```

(Use the same `DATABASE_URL` as production, or use Vercel CLI with env pulled locally.)

## Project Structure

```
src/
  app/           # Pages & API routes
  components/    # UI (board, navbar, forms)
  lib/           # Auth, ELO, Prisma
prisma/
  schema.prisma  # Database models
```

## API Overview

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Create account |
| `/api/auth/login` | POST | Sign in |
| `/api/auth/logout` | POST | Sign out |
| `/api/friends` | GET/POST | List friends / send request |
| `/api/rooms` | GET/POST/PUT | List / create / join rooms |
| `/api/rooms/[id]` | GET | Room state |
| `/api/rooms/[id]/move` | POST | Make a move |
| `/api/account` | GET/PATCH | Profile & password |

## License

MIT
