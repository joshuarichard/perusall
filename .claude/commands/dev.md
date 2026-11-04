Start the development environment and verify both servers are running.

1. Run `npm run dev` in the background
2. Wait for both servers to be ready:
   - Frontend: http://localhost:5173
   - API Server: http://localhost:3001
3. Verify the API is responding: `curl -s http://localhost:3001/api/users | head -c 100`
4. Report status
