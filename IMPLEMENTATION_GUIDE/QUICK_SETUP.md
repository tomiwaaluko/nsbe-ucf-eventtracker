# Quick Setup Script - Run All Commands at Once

This file contains all the commands needed to set up the NSBE backend.

## ⚠️ IMPORTANT: Update .env First!

Before running any commands, update your `.env` file with actual values:

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
SUPABASE_JWT_SECRET="your-actual-jwt-secret-from-supabase"
PORT=4000
```

---

## Option 1: Copy-Paste All Commands (Windows PowerShell)

```powershell
# Phase 1: Prisma Setup
npx prisma init
npx prisma migrate dev --name init
npx nest g module prisma
npx nest g service prisma

# Phase 2: Auth Module
npx nest g module auth
npx nest g service auth
npx nest g guard auth/jwt

# Phase 3: Members Module
npx nest g module members
npx nest g controller members
npx nest g service members
New-Item -ItemType Directory -Force -Path "src/members/dto"

# Phase 4: Events Module
npx nest g module events
npx nest g controller events
npx nest g service events
New-Item -ItemType Directory -Force -Path "src/events/dto"

# Phase 5: Attendance Module
npx nest g module attendance
npx nest g controller attendance
npx nest g service attendance
New-Item -ItemType Directory -Force -Path "src/attendance/dto"

# Phase 6: Stats Module
npx nest g module stats
npx nest g controller stats
npx nest g service stats

# Phase 7: Common Utilities
New-Item -ItemType Directory -Force -Path "src/common"

# Phase 8: Install Validation
npm install class-validator class-transformer

# Create docs directory
New-Item -ItemType Directory -Force -Path "docs"

Write-Host "✅ All modules and directories created!"
Write-Host "📝 Now copy the code from COMPLETE_IMPLEMENTATION.md and COMPLETE_IMPLEMENTATION_PART2.md"
```

---

## Option 2: Step-by-Step Instructions

### 1. Initialize Prisma
```bash
npx prisma init
```

### 2. Copy schema from PHASE_1_PRISMA.md to `prisma/schema.prisma`

### 3. Run migration
```bash
npx prisma migrate dev --name init
```

### 4. Generate all modules
```bash
# Prisma
npx nest g module prisma
npx nest g service prisma

# Auth
npx nest g module auth
npx nest g service auth
npx nest g guard auth/jwt

# Members
npx nest g module members
npx nest g controller members
npx nest g service members

# Events
npx nest g module events
npx nest g controller events
npx nest g service events

# Attendance
npx nest g module attendance
npx nest g controller attendance
npx nest g service attendance

# Stats
npx nest g module stats
npx nest g controller stats
npx nest g service stats
```

### 5. Create necessary directories
```bash
mkdir src/members/dto
mkdir src/events/dto
mkdir src/attendance/dto
mkdir src/common
mkdir docs
```

### 6. Install validation packages
```bash
npm install class-validator class-transformer
```

### 7. Copy all code from implementation guides
Open `COMPLETE_IMPLEMENTATION.md` and `COMPLETE_IMPLEMENTATION_PART2.md` and copy each file's content to the corresponding location.

### 8. Start development server
```bash
npm run start:dev
```

### 9. Open Prisma Studio (in another terminal)
```bash
npx prisma studio
```

---

## Verification Checklist

After setup, verify everything works:

- [ ] `.env` file has real database credentials
- [ ] Prisma schema is in `prisma/schema.prisma`
- [ ] Migration ran successfully
- [ ] All modules are created (prisma, auth, members, events, attendance, stats)
- [ ] All DTOs are in their respective folders
- [ ] `src/common/roles.util.ts` exists
- [ ] `src/main.ts` is updated with validation and CORS
- [ ] `src/app.module.ts` imports all modules
- [ ] Server starts without errors (`npm run start:dev`)
- [ ] Can access `http://localhost:4000/api` (should see a response)
- [ ] Prisma Studio opens (`npx prisma studio`)

---

## Quick Testing

### Test Database Connection
```bash
npx prisma studio
```
You should be able to see your tables: Member, Event, Attendance

### Test API Endpoint
```bash
curl http://localhost:4000/api/events
```
Should return an empty array `[]` or any events you created

### Test with Real Frontend
1. Get a Supabase JWT token from your frontend
2. Use Postman/Thunder Client to test authenticated endpoints
3. Example: GET `http://localhost:4000/api/stats/me?semester=Fall%202024`

---

## Common Issues & Fixes

### "Cannot find module '@prisma/client'"
```bash
npm install @prisma/client
npx prisma generate
```

### "PrismaClient is not a constructor"
```bash
npx prisma generate
```

### Database connection errors
1. Check your `DATABASE_URL` in `.env`
2. Make sure Supabase database is running
3. Verify your IP is allowlisted in Supabase

### TypeScript errors
```bash
# Restart TypeScript server in VS Code
Ctrl+Shift+P → "TypeScript: Restart TS Server"

# Or regenerate Prisma Client
npx prisma generate
```

### Port already in use
Change `PORT` in `.env` to a different number (e.g., 4001)

---

## Next Steps After Setup

1. **Test all endpoints** using the API documentation in `docs/api.md`
2. **Create test data** using Prisma Studio
3. **Integrate with your frontend**
4. **Deploy to production** (Railway, Vercel, etc.)

---

Need help? Check the detailed implementation guides:
- `COMPLETE_IMPLEMENTATION.md` - Phases 2-5
- `COMPLETE_IMPLEMENTATION_PART2.md` - Phases 6-10
