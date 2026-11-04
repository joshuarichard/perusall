Reset the database and re-seed with sample data.

1. Stop any running dev servers (TaskStop)
2. Run `npm run db:reset`
3. Restart dev servers: `npm run dev` in the background
4. Wait for both servers to be ready (client :5173, server :3001)
5. Verify seed data: `curl -s http://localhost:3001/api/users` (should return 5 users)
6. Verify readings: `curl -s http://localhost:3001/api/readings` (should return seeded readings)
7. Report what was seeded
