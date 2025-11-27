# 🔐 Environment Variables Guide

Panduan lengkap setup environment variables untuk local development dan production.

---

## 📋 Required Variables

### For Local Development (.env file)

```env
# ============================================
# DATABASE CONFIGURATION
# ============================================
# MongoDB connection string
# Get this from MongoDB Atlas or use local MongoDB
MONGODB_URI=mongodb+srv://mathero_db_user:81nhcbKnkzxrMqKG@cluster0.zcr4uru.mongodb.net/mathgame?retryWrites=true&w=majority

# For local MongoDB (alternative):
# MONGODB_URI=mongodb://localhost:27017/mathgame

# ============================================
# AUTHENTICATION
# ============================================
# Secret key for JWT (if implemented)
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-super-secret-jwt-key-min-32-characters-long

# ============================================
# APPLICATION SETTINGS
# ============================================
# Default PIN for parent login
# Users can change this per student in the database
DEFAULT_PARENT_PIN=1234

# Server port for local development
PORT=3000

# Node environment
NODE_ENV=development
```

---

## 🔧 Setup Instructions

### 1. Copy Template File
```bash
cp .env.example .env
```

### 2. Edit .env File
Open `.env` in your text editor and fill in the values:

```bash
# On Mac/Linux
nano .env

# On Windows
notepad .env

# Or use VS Code
code .env
```

### 3. Get MongoDB URI

#### Option A: MongoDB Atlas (Recommended for Production)

1. Go to https://mongodb.com/cloud/atlas
2. Create free cluster
3. Database Access → Add User
4. Network Access → Allow 0.0.0.0/0
5. Connect → Application → Copy connection string
6. Replace `<password>` with your actual password
7. Add `/mathgame` after `.net` before `?`

**Example:**
```
mongodb+srv://mathgameuser:MyPassword123@cluster0.abc12.mongodb.net/mathgame?retryWrites=true&w=majority
```

#### Option B: Local MongoDB (For Development)

1. Install MongoDB locally
2. Use:
```env
MONGODB_URI=mongodb://localhost:27017/mathgame
```

### 4. Generate JWT Secret

Run in terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copy output and paste to `.env`:
```env
JWT_SECRET=a1b2c3d4e5f6...
```

---

## 🌐 Production Setup (Vercel)

### Add Environment Variables in Vercel Dashboard

1. Go to your project in Vercel
2. Settings → Environment Variables
3. Add each variable:

#### Variable 1: MONGODB_URI
```
Name: MONGODB_URI
Value: mongodb+srv://username:password@cluster.mongodb.net/mathgame?retryWrites=true&w=majority
Environment: Production, Preview, Development
```

#### Variable 2: JWT_SECRET
```
Name: JWT_SECRET
Value: [your generated secret key]
Environment: Production, Preview, Development
```

#### Variable 3: DEFAULT_PARENT_PIN
```
Name: DEFAULT_PARENT_PIN
Value: 1234
Environment: Production, Preview, Development
```

#### Variable 4: NODE_ENV (Optional)
```
Name: NODE_ENV
Value: production
Environment: Production
```

### Important Notes:

⚠️ **Security**:
- Never commit `.env` to GitHub (it's in .gitignore)
- Use different secrets for development and production
- Change `DEFAULT_PARENT_PIN` to something secure for production

⚠️ **MongoDB Password**:
- If password contains special characters, URL encode them
- Example: `P@ss!word` becomes `P%40ss%21word`
- Or use simple passwords for easier setup

⚠️ **Connection String**:
- Make sure to add database name (`mathgame`) in the URI
- Check the format: `...mongodb.net/mathgame?retryWrites=...`

---

## ✅ Verification

### Test Local Setup

```bash
# Start server
npm start

# Should see:
# ✅ MongoDB Connected: cluster0-xxxxx.mongodb.net
# 🚀 Server berjalan di port 3000
```

### Test Production Setup

Open in browser:
```
https://your-app.vercel.app/api/health
```

Should return:
```json
{
  "success": true,
  "message": "Server is running!",
  "timestamp": "2024-01-20T10:30:00.000Z"
}
```

---

## 🔍 Troubleshooting

### Error: "Cannot connect to MongoDB"

**Check:**
1. MongoDB URI is correct
2. Password doesn't have special characters (or is URL encoded)
3. Database name is included in URI
4. IP is whitelisted in MongoDB Atlas (0.0.0.0/0)
5. MongoDB cluster is running

**Solution:**
```bash
# Test connection
node -e "require('mongodb').MongoClient.connect('YOUR_URI', (err, client) => { console.log(err ? 'Error: ' + err : 'Connected!'); client.close(); })"
```

### Error: "JWT_SECRET is not defined"

**Check:**
1. `.env` file exists in root directory
2. Variable is spelled correctly (case sensitive)
3. No spaces around `=` sign
4. Value is at least 32 characters

**Solution:**
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Error: "PORT already in use"

**Solution:**
```bash
# Change port in .env
PORT=3001

# Or kill process using port 3000
# Mac/Linux:
lsof -ti:3000 | xargs kill -9

# Windows:
netstat -ano | findstr :3000
taskkill /PID [PID] /F
```

---

## 📝 Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| MONGODB_URI | ✅ Yes | - | MongoDB connection string |
| JWT_SECRET | ✅ Yes | - | Secret key for JWT tokens |
| DEFAULT_PARENT_PIN | ⚠️ Recommended | 1234 | Default parent PIN |
| PORT | ❌ No | 3000 | Server port (local only) |
| NODE_ENV | ❌ No | development | Environment mode |

---

## 🔐 Security Best Practices

### For Development:
```env
# .env (local)
MONGODB_URI=mongodb://localhost:27017/mathgame_dev
JWT_SECRET=dev-secret-key-not-for-production
DEFAULT_PARENT_PIN=1234
```

### For Production:
```env
# Vercel Environment Variables
MONGODB_URI=mongodb+srv://prod_user:StrongP@ssw0rd@prod-cluster.mongodb.net/mathgame
JWT_SECRET=[64-character-random-string]
DEFAULT_PARENT_PIN=8765  # Different from default
```

### Additional Security:
- Use different database credentials for production
- Rotate JWT_SECRET periodically
- Enable MongoDB Atlas audit logs
- Use Vercel's built-in secrets encryption
- Monitor unauthorized access attempts

---

## 📚 Additional Resources

- **MongoDB Atlas Setup**: https://docs.atlas.mongodb.com/getting-started/
- **Vercel Environment Variables**: https://vercel.com/docs/concepts/projects/environment-variables
- **Node.js dotenv**: https://github.com/motdotla/dotenv
- **Security Best Practices**: https://cheatsheetseries.owasp.org/

---

## 🆘 Still Having Issues?

1. Check all variables are set correctly
2. Restart server after changing .env
3. Clear browser cache
4. Check Vercel deployment logs
5. Check MongoDB Atlas logs
6. Create issue in GitHub repository

---

**Ready to configure?** Follow the steps above! 🚀

**Need help?** Check DEPLOYMENT.md for more details! 📖
