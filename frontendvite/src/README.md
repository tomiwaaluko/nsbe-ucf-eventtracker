# NSBE UCF Event Tracker - UI System

A complete responsive web application for tracking NSBE (National Society of Black Engineers) UCF chapter events and member attendance progress.

## 🎨 Design System

### Color Palette (NSBE Brand Colors)
- **Primary Green**: `#00a651` - Main brand color
- **Secondary Red**: `#ed1c24` - Community service emphasis
- **Accent Gold**: `#ffb81c` - Workshops and highlights
- **Black**: `#000000` - Text and contrast

### Typography
- **Headings**: System font stack with proper hierarchy (h1-h6)
- **Body**: 1rem base size with 1.5 line-height
- **Accessible**: WCAG AA compliant contrast ratios

### Components
All components are built with:
- ✅ WCAG 2.1 AA accessibility compliance
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Motion and animation using Motion/React
- ✅ Auto-layout with Flexbox and Grid

## 📱 Pages & Features

### 1. Dashboard
- **Welcome header** with personalized greeting
- **Stats overview** (Total Events, Workshops, GBMs, Community Service)
- **3-3-3 Progress tracking** with visual progress cards
- **Overall progress ring** showing completion percentage
- **Interactive charts** (Bar chart and Pie chart using Recharts)
- **Achievement badges** for milestones
- **Upcoming events** preview

### 2. Events Page
- **Search and filter** events by category and time
- **Event cards** with all details (date, time, location, attendees)
- **Grouped events** (Today, Upcoming, Past)
- **Quick check-in** from event cards
- **Admin: Create event** button (role-based)

### 3. Event Detail Page
- **Hero section** with gradient background
- **Full event details** (date, time, location, category)
- **Attendee list** with avatars
- **Check-in button** for active events
- **Edit functionality** for admins
- **Event organizer** information

### 4. Check-In Page
- **QR code scanner** interface (simulated)
- **Manual code entry** option
- **Real-time feedback** (success/error messages)
- **Instructions** and tips for checking in
- **Visual confirmation** with animations

### 5. Member Profile / Achievements
- **Profile header** with avatar and role badge
- **Stats cards** showing attendance breakdown
- **3-3-3 progress visualization**
- **Achievement badges** (1-1-1, 3-3-3, milestones)
- **Attendance history table** (responsive)

### 6. Admin: Create Event Form
- **Comprehensive form** with validation
- **Category selection** (GBM, Workshop, Community Service)
- **Date/time pickers** with validation
- **Location input**
- **Real-time error feedback**
- **Semester tracking**

## 🧩 Reusable Components

### UI Components
- **ProgressRing** - Circular progress indicator with animation
- **ProgressCard** - Category progress with target tracking
- **AchievementBadge** - Locked/unlocked achievement display
- **StatsCard** - Metric display with icons and trends
- **EventCard** - Event preview with quick actions
- **AttendanceTable** - Responsive table for attendance history
- **Sidebar** - Navigation with mobile support

### ShadCN Components Used
- Button, Input, Textarea, Label
- Badge, Avatar
- Select, Dialog, Card
- Tooltip, Separator
- Form components

## 🎯 Progress Tracking System

### 1-1-1 Requirement
- 1 Workshop (SOCIAL_AEX)
- 1 General Body Meeting (GBM)
- 1 Community Service event (COMMUNITY_SERVICE)

### 3-3-3 Goal
- 3 Workshops (SOCIAL_AEX)
- 3 General Body Meetings (GBM)
- 3 Community Service events (COMMUNITY_SERVICE)

### Visual Indicators
- Progress bars for each category
- Percentage completion
- Achievement badges
- Color-coded categories

## 🔐 Role-Based Access

### Member
- View dashboard and personal progress
- Browse events
- Check in to events
- View achievements

### Admin
- All member features
- Create events
- View all members (placeholder)
- View statistics (placeholder)
- Edit events

### Super Admin
- All admin features
- Additional administrative controls

## 📊 Data Visualization

### Charts (Recharts)
- **Bar Chart** - Attendance by category vs target
- **Pie Chart** - Event distribution
- **Progress Rings** - Overall completion percentage

### Interactive Elements
- Animated progress bars
- Motion-based card animations
- Hover effects and transitions
- Loading states

## 🎨 Responsive Breakpoints

- **Mobile**: < 640px
- **Tablet**: 640px - 1024px
- **Desktop**: > 1024px

### Mobile Features
- Hamburger menu navigation
- Stacked layouts
- Touch-optimized buttons
- Responsive tables/cards

## 🚀 Getting Started

This application is built with:
- React + TypeScript
- Tailwind CSS v4.0
- Motion/React (Framer Motion)
- Recharts
- ShadCN UI components
- Lucide React icons

### Mock Data
The application currently uses mock data to demonstrate functionality. To connect to your backend:

1. Replace mock data in `App.tsx` with API calls
2. Update the endpoints to match your NestJS backend
3. Implement authentication with Supabase JWT
4. Connect to your PostgreSQL database

### Backend Integration

Based on your Prisma schema:
```typescript
// Events endpoint
GET    /api/events
POST   /api/events (admin only)
GET    /api/events/:id
PATCH  /api/events/:id (admin only)

// Attendance endpoint
POST   /api/attendance/check-in
GET    /api/attendance/member/:id

// Members endpoint
GET    /api/members/me
GET    /api/members/:id
GET    /api/members (admin only)

// Stats endpoint
GET    /api/stats/member/:id
GET    /api/stats/overview (admin only)
```

## ✨ Key Features

### Accessibility
- Semantic HTML
- ARIA labels and roles
- Keyboard navigation support
- Focus visible states
- Color contrast compliance

### Performance
- Lazy loading ready
- Optimized animations
- Responsive images (when added)
- Efficient re-renders

### User Experience
- Intuitive navigation
- Clear visual hierarchy
- Consistent interactions
- Helpful error messages
- Success confirmations

## 🎨 Design Patterns

### Card-Based Layout
- Rounded corners (0.75rem - 1rem)
- Subtle shadows
- White backgrounds on gray base
- Border accents

### Color Coding
- Green: GBMs and overall brand
- Gold: Workshops and achievements
- Red: Community service
- Blue: Information and today's events

### Typography Scale
- H1: 2.25rem (36px)
- H2: 1.875rem (30px)
- H3: 1.5rem (24px)
- H4: 1.25rem (20px)
- Body: 1rem (16px)

## 📝 Future Enhancements

- Real-time QR code scanning
- Push notifications for events
- Email reminders
- Leaderboard functionality
- Export attendance reports
- Social sharing features
- Event calendar integration
- Photo galleries

## 🤝 Contributing

When contributing:
1. Follow the existing design system
2. Maintain accessibility standards
3. Test on multiple screen sizes
4. Use existing components when possible
5. Document new components

---

Built with ❤️ for NSBE UCF
