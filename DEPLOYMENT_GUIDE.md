# Migration & Deployment Guide

This document provides step-by-step instructions for deploying the SenNoflaay management application to production and migrating your data from SQLite to PostgreSQL.

## Table of Contents

1. [From SQLite to PostgreSQL](#from-sqlite-to-postgresql)
2. [Local Development Setup](#local-development-setup)
3. [Deploy to Supabase](#deploy-to-supabase)
4. [Deploy to Cloud Platforms](#deploy-to-cloud-platforms)
5. [Environment Configuration](#environment-configuration)
6. [Post-Deployment Steps](#post-deployment-steps)

---

## From SQLite to PostgreSQL

### Why Migrate?

- **Scalability**: PostgreSQL handles thousands of concurrent users
- **Reliability**: ACID compliance, automatic backups
- **Cloud-Ready**: Works seamlessly with managed services like Supabase
- **Multi-tenancy**: Better support for multiple associations
- **Performance**: Native JSON support, better indexing
- **Security**: Row-level security, better permission controls

### Migration Path

**Option 1: Use Supabase (Recommended for Production)**

1. Create a Supabase account at https://supabase.com
2. Create a new project
3. Go to SQL Editor and run [migrations/001-initial-schema.sql](migrations/001-initial-schema.sql)
4. Copy your project URL and API keys
5. Migrate data (see Data Migration below)

**Option 2: Use Heroku Postgres**

1. Create Heroku app: `heroku create your-app-name`
2. Add Postgres: `heroku addons:create heroku-postgresql:hobby-dev`
3. Get connection URL: `heroku config:get DATABASE_URL`
4. Run migrations using the provided SQL script
5. Configure environment variables

**Option 3: Self-Hosted PostgreSQL**

1. Install PostgreSQL 15+
2. Create database: `createdb sennoflaay`
3. Run SQL script: `psql sennoflaay < migrations/001-initial-schema.sql`
4. Set connection string: `postgresql://user:password@localhost:5432/sennoflaay`

### Data Migration (SQLite → PostgreSQL)

**Note**: Your existing SQLite data will be **automatically** handled by the new application. The old `database.sqlite` file is no longer used.

If you need to preserve old data:

1. **Export from SQLite**:
   ```bash
   sqlite3 database.sqlite ".mode csv" ".output export.sql" ".dump"
   ```

2. **Use Third-Party Tools**:
   - pgLoader: Automates SQLite → PostgreSQL migration
   - DBeaver: Visual migration tool
   - Custom Python scripts for selective data import

3. **Manual Import**: 
   - Set up new PostgreSQL schema
   - Import CSV/JSON exports with transformed data
   - Verify data integrity

---

## Local Development Setup

### Prerequisites

- Node.js 20+ and npm 10+
- Docker and Docker Compose
- Git

### Quick Start

1. **Clone and Install**:
   ```bash
   git clone <repository>
   cd sennoflaay-management
   npm ci
   ```

2. **Configure Environment**:
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials or leave defaults for docker-compose
   ```

3. **Start with Docker Compose** (includes PostgreSQL):
   ```bash
   docker-compose up -d
   ```
   
   This starts:
   - PostgreSQL database on `localhost:5432`
   - pgAdmin interface on `localhost:5050`
   - Application on `localhost:3000`

4. **Or Start Locally** (if PostgreSQL is already running):
   ```bash
   npm run dev
   ```

5. **Access Application**:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3000/api
   - Health Check: http://localhost:3000/health

### Test Login

```
Association ID: default-assoc
Username: admin
Password: admin123
```

**⚠️ Change this default password immediately in production!**

---

## Deploy to Supabase

Supabase is the easiest path to production—managed PostgreSQL with built-in auth, storage, and real-time features.

### Step 1: Create Supabase Project

1. Visit https://app.supabase.com
2. Sign in or create account
3. Click "New Project"
4. Fill details and create

### Step 2: Setup Database

1. Go to "SQL Editor"
2. Create a new query
3. Paste content from `migrations/001-initial-schema.sql`
4. Run query

### Step 3: Get Credentials

In Supabase dashboard:
1. Settings → API
2. Copy:
   - Project URL → `SUPABASE_URL`
   - `anon` key → `SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_KEY`

### Step 4: Deploy Application

**Option A: Vercel (Frontend only)**

```bash
npm run build
npx vercel --prod
```

**Option B: Railway (Full Stack)**

1. Connect GitHub repository to Railway
2. Add PostgreSQL addon
3. Set environment variables
4. Deploy

**Option C: Render**

1. Connect repository to Render
2. Create PostgreSQL service
3. Create web service
4. Set environment variables
5. Deploy

---

## Deploy to Cloud Platforms

### Render (Recommended for Beginners)

1. **Create Postgres Database**:
   - New → PostgreSQL
   - Choose plan (Free tier available)

2. **Get Connection String**:
   - Copy internal connection URL

3. **Create Web Service**:
   - Connect your GitHub repo
   - Runtime: Node
   - Build command: `npm install && npm run build`
   - Start command: `npm start`
   - Add environment variables

4. **Deploy**:
   - Click "Create Web Service"

### Railway

1. **Create Database**:
   - Add service → PostgreSQL

2. **Create Application**:
   - Add service → GitHub
   - Select repository

3. **Configure**:
   - Set Node version: 20
   - Environment variables

4. **Deploy**:
   - Auto-deploys on git push

### Heroku

```bash
# Install Heroku CLI
brew install heroku/brew/heroku

# Login
heroku login

# Create app
heroku create your-app-name

# Add PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set JWT_SECRET=your-secret-key
heroku config:set SUPABASE_URL=your-url
# ... set all variables from .env.example

# Deploy
git push heroku main
```

### AWS (EC2 + RDS)

1. **Launch EC2 Instance** (Ubuntu 22.04):
   ```bash
   sudo apt update && sudo apt install -y nodejs npm docker.io
   sudo usermod -aG docker $USER
   ```

2. **Create RDS PostgreSQL Database** in AWS Console

3. **Deploy Application**:
   ```bash
   git clone <repo>
   cd sennoflaay-management
   npm ci
   # Set environment variables
   npm start
   ```

4. **Use PM2 for Process Management**:
   ```bash
   npm install -g pm2
   pm2 start "npm start" --name sennoflaay
   pm2 save && pm2 startup
   ```

5. **Setup Nginx Reverse Proxy**:
   ```bash
   sudo apt install nginx
   # Configure /etc/nginx/sites-available/sennoflaay
   sudo systemctl start nginx
   ```

---

## Environment Configuration

### Critical Variables

```env
# Must change in production:
JWT_SECRET=generate-a-strong-random-string
SUPABASE_SERVICE_KEY=your-actual-key  # Not public!

# Database Connection:
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# Application URLs:
APP_URL=https://your-domain.com
ALLOWED_ORIGINS=https://your-domain.com
```

### How to Generate JWT_SECRET

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Secure Secret Storage

**Never** commit `.env` to git! Instead:

- Use platform-specific secret managers:
  - Railway: Environment variables
  - Render: Environment groups
  - Heroku: Config vars
  - AWS: Secrets Manager
  - Supabase: Environment settings

---

## Post-Deployment Steps

### 1. Verify Deployment

```bash
curl https://your-domain.com/health
# Should return: { "status": "ok", ... }
```

### 2. Update Default Credentials

```bash
# Via API or admin panel:
POST /api/users/:username
{
  "password": "NewStrongPassword123!",
  "role": "superadmin"
}
```

### 3. Configure DNS

If using custom domain:
1. Add DNS record pointing to your host
2. Configure SSL certificate (most platforms auto-handle)
3. Test HTTPS

### 4. Setup Monitoring

- **Sentry** for error tracking: `npm install @sentry/node`
- **LogRocket** for session replay
- **Datadog/New Relic** for performance monitoring
- **Uptime Monitoring**: Heroku, UptimeRobot, or others

### 5. Database Backups

**Supabase**: Automatic daily backups (Pro plan+)

**Self-hosted**: Setup automated backups:
```bash
# Daily backup script
0 2 * * * pg_dump -h localhost -U sennoflaay sennoflaay > /backups/sennoflaay-$(date +\%Y\%m\%d).sql
```

### 6. Enable HTTPS

Most platforms auto-enable; if not:
- Use Let's Encrypt (free): Certbot
- Or purchase SSL certificate

### 7. Setup Email Notifications (Optional)

For production alerts:
```envenv
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=app-password
```

---

## Troubleshooting

### "Connection refused" Error

**Solution**: Verify database URL and firewall rules:
```bash
psql $SUPABASE_URL -U postgres -d postgres -c "SELECT version();"
```

### "Invalid JWT Token"

**Solution**: 
- Verify `JWT_SECRET` matches between frontend and backend
- Check token expiration (default 24h)
- Clear browser cache/cookies

### Performance Issues

**Optimization**:
1. Add database indexes (already in schema)
2. Implement caching: Redis or CDN
3. Use pagination for large datasets
4. Monitor query performance in pgAdmin/Supabase dashboard

### Deployment Fails

**Debug**:
```bash
# Check application logs
heroku logs --tail
# or
docker logs sennoflaay-app

# Check Git status
git status
git log --oneline -5
```

---

## Next Steps

1. ✅ Deploy to production
2. ✅ Configure domain and SSL
3. ✅ Setup monitoring and backups
4. ✅ Add team members and permissions
5. ✅ Configure GitHub OAuth (optional)
6. ✅ Setup CI/CD pipeline
7. ✅ Document your deployment

**Questions?** Check [README.md](README.md) or create an issue on GitHub.
