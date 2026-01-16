# Troubleshooting Guide

## Network Error: Cannot Connect to Backend

If you're seeing "Network error" or "Failed to load dashboard data" errors, follow these steps:

### Step 1: Verify Backend Server is Running

1. **Open a terminal** and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. **Start the Django server**:
   ```bash
   python manage.py runserver
   ```

3. **Verify it's running** - You should see:
   ```
   Starting development server at http://127.0.0.1:8000/
   ```

4. **Test the backend** - Open http://localhost:8000/admin/ in your browser. You should see the Django admin login page (or an error page, but it means the server is running).

### Step 2: Check Backend Logs

When you submit feedback or the dashboard loads, check the terminal where Django is running. You should see:
- Request logs showing API calls
- Any error messages

### Step 3: Verify CORS Configuration

The backend is now configured to allow all origins in development mode. If you still see CORS errors:

1. Check `backend/feedback_hub/settings.py` - ensure `DEBUG = True`
2. Restart the Django server after making changes

### Step 4: Check Frontend Configuration

1. **Verify API URL** - Open browser console (F12) and check:
   - Look for "API Base URL: ..." message
   - Should show `/api` (using proxy) or `http://localhost:8000/api`

2. **Check Vite Proxy** - The `frontend/vite.config.js` has a proxy configured:
   ```js
   proxy: {
     '/api': {
       target: 'http://localhost:8000',
       changeOrigin: true,
     },
   }
   ```

### Step 5: Test API Endpoints Directly

Test if the backend API is accessible:

1. **Test feedback submission** (should work without auth):
   ```bash
   curl -X POST http://localhost:8000/api/feedback/ \
     -H "Content-Type: application/json" \
     -d '{"product_id":"Rings","rating":5,"review_text":"Test review"}'
   ```

2. **Test aggregated endpoint** (requires auth token):
   ```bash
   curl http://localhost:8000/api/feedback/aggregated_sentiment/ \
     -H "Authorization: Token dev-token-change-in-production"
   ```

### Common Issues and Solutions

#### Issue: "Network Error" persists
- **Solution**: Make sure Django server is running on port 8000
- **Check**: Open http://localhost:8000/admin/ in browser

#### Issue: CORS errors in browser console
- **Solution**: Restart Django server after CORS config changes
- **Check**: Ensure `CORS_ALLOW_ALL_ORIGINS = True` when `DEBUG = True`

#### Issue: 403 Forbidden on protected endpoints
- **Solution**: Check that `VITE_ADMIN_TOKEN` in frontend `.env` matches `ADMIN_TOKEN` in backend `.env`
- **Default**: Both should be `dev-token-change-in-production`

#### Issue: 500 Internal Server Error on /api requests
- **Cause**: The frontend proxy might be trying to connect to `localhost` inside the Docker container, where the backend is not running.
- **Solution**: 
  1. Update `frontend/vite.config.js` to point the proxy target to `http://backend:8000` instead of `http://localhost:8000`.
  2. Or, ensure `VITE_API_URL` is set to `http://localhost:8000/api` to bypass the proxy.

#### Issue: 500 Internal Server Error
- **Solution**: Check Django server logs for detailed error messages
- **Common causes**: Database migration issues, missing dependencies

#### Issue: "docker" command not found
- **Cause**: Docker is not installed or not in your system PATH.
- **Solution**: If you are running the project locally (using `python manage.py runserver` and `npm run dev`), you do not need to run Docker commands. Simply stop the frontend server (Ctrl+C) and start it again (`npm run dev`).

#### Issue: `net::ERR_CONNECTION_REFUSED`
- **Cause**: The backend server is not running, or the browser cannot connect to `localhost:8000`.
- **Solution**: 
  1. Ensure the Django server is running (`python manage.py runserver`).
  2. If it is running, try accessing `http://127.0.0.1:8000/admin` in your browser.
  3. If that works, the issue might be `localhost` resolution. The `api.js` file has been updated to use `127.0.0.1` to fix this.

#### Question: Do I need to keep the backend terminal open?
- **Answer**: **Yes.** You must have two terminal windows running simultaneously for the application to work locally:
  1. **Terminal 1 (Backend)**: Runs `python manage.py runserver`. This serves the API and database.
  2. **Terminal 2 (Frontend)**: Runs `npm run dev`. This serves the user interface.
- **Note**: If you close the backend terminal, the frontend will show network errors because the API server is offline.

### Quick Health Check Script

Run this to verify backend is accessible:
```bash
cd backend
python check_server.py
```

### Port Conflicts

If port 8000 is already in use:
1. Find what's using it: `netstat -ano | findstr :8000` (Windows) or `lsof -i :8000` (Mac/Linux)
2. Change Django port: `python manage.py runserver 8001`
3. Update frontend `.env`: `VITE_API_URL=http://localhost:8001/api`

### Still Having Issues?

1. Check browser console (F12) for detailed error messages
2. Check Django server terminal for backend errors
3. Verify both servers are running:
   - Backend: http://localhost:8000
   - Frontend: http://localhost:5173
