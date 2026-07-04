# MongoDB Atlas Setup for Render Deployment

## Error: MongooseServerSelectionError / IP Whitelist

If you see this error on Render:
```
MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster. 
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## Solution

### 1. Go to MongoDB Atlas Dashboard
https://cloud.mongodb.com/

### 2. Navigate to Network Access
- Click on your cluster
- Go to "Network Access" in the left sidebar
- Or: Database → Security → Network Access

### 3. Add IP Address
Option A: Allow Access from Anywhere (Development)
- Click "Add IP Address"
- Enter: `0.0.0.0/0`
- Click "Confirm"

Option B: Whitelist Render IPs (Production - More Secure)
- Click "Add IP Address"
- Enter: `0.0.0.0/0` temporarily for testing, or add specific Render.com IP ranges

### 4. Verify Database User
- Go to Database → Security → Database Users
- Ensure the user has correct permissions (readWrite on your database)
- If using MONGODB_URI with authentication, verify username/password are correct

### 5. Verify MONGODB_URI Format
Correct format:
```
mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority
```

### 6. Set Environment Variable in Render
- Go to your Render service → Environment tab
- Add/Update `MONGODB_URI` with your Atlas connection string
- Example: `mongodb://localhost:27017/alphalegalgpt` (local) or your Atlas URI

### 7. Redeploy
- Trigger a new deploy in Render
- Monitor logs for "✅ Connected to MongoDB"

## Local Development
For local MongoDB, use:
```
MONGODB_URI=mongodb://localhost:27017/alphalegalgpt
```

## Common Issues

1. **IP Whitelist**: Most common cause - add 0.0.0.0/0 to Atlas Network Access
2. **Wrong URI format**: Ensure you copy the full connection string from Atlas
3. **Database User**: Ensure user exists and has correct password
4. **CORS/Network**: Check firewall settings