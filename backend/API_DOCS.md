# API Documentation - AI Task Management App

## Base URL
```
http://localhost:8000/api/
```

## Authentication
All endpoints except registration and login require JWT authentication.

**Header Format:**
```
Authorization: Bearer <access_token>
```

---

## 🔐 Authentication Endpoints

### User Registration
**POST** `/auth/register/`

**Request Body:**
```json
{
    "email": "user@example.com",
    "username": "username",
    "first_name": "John",
    "last_name": "Doe",
    "password": "securepassword",
    "password_confirm": "securepassword",
    "theme_preference": "light"
}
```

**Response:**
```json
{
    "user": {...},
    "refresh": "refresh_token",
    "access": "access_token",
    "message": "User created successfully"
}
```

### User Login
**POST** `/auth/login/`

**Request Body:**
```json
{
    "email": "user@example.com",
    "password": "securepassword"
}
```

**Response:**
```json
{
    "user": {...},
    "refresh": "refresh_token",
    "access": "access_token",
    "message": "Welcome back, John!"
}
```

### Dashboard Greeting
**GET** `/auth/greeting/`

**Response:**
```json
{
    "greeting": "Good Morning, John!",
    "user": {...}
}
```

---

## 📋 Task Management Endpoints

### List/Create Tasks
**GET** `/tasks/`
- Query Parameters: `priority`, `status`, `category`, `search`, `ordering`

**POST** `/tasks/`

**Request Body:**
```json
{
    "title": "Complete project documentation",
    "description": "Write comprehensive API docs",
    "category": 1,
    "priority": "high",
    "due_date": "2025-06-30T17:00:00Z",
    "estimated_duration": 120,
    "tags": ["documentation", "urgent"]
}
```

### Task Details
**GET/PUT/DELETE** `/tasks/{id}/`

### Mark Task Complete
**POST** `/tasks/{id}/complete/`

### Today's Tasks
**GET** `/tasks/today/`

### Upcoming Tasks (Next 7 days)
**GET** `/tasks/upcoming/`

### Calendar View
**GET** `/tasks/calendar/`
- Query Parameters: `start_date`, `end_date` (YYYY-MM-DD format)

### Task Statistics
**GET** `/tasks/stats/`

**Response:**
```json
{
    "total_tasks": 45,
    "completed_tasks": 32,
    "pending_tasks": 13,
    "overdue_tasks": 3,
    "completion_rate": 71.11,
    "tasks_by_priority": {...},
    "tasks_by_category": {...},
    "recent_activity": [...]
}
```

### Bulk Actions
**POST** `/tasks/bulk-action/`

**Request Body:**
```json
{
    "task_ids": [1, 2, 3],
    "action": "mark_completed"  // or "mark_todo", "delete"
}
```

---

## 📅 Day Planner Endpoints

### List/Create Day Plans
**GET/POST** `/tasks/day-planner/`

**Request Body:**
```json
{
    "date": "2025-06-25",
    "task_ids": [1, 2, 3],
    "notes": "Focus on high-priority items",
    "mood": "excellent",
    "productivity_score": 8
}
```

### Day Plan Details
**GET/PUT/DELETE** `/tasks/day-planner/{id}/`

---

## 🏷️ Categories

### List/Create Categories
**GET/POST** `/tasks/categories/`

### Category Details
**GET/PUT/DELETE** `/tasks/categories/{id}/`

---

## 🤖 AI Analytics Endpoints

### User Analytics
**GET** `/analytics/user-analytics/`

**Response:**
```json
{
    "total_tasks_created": 100,
    "total_tasks_completed": 85,
    "productivity_score": 87.5,
    "current_streak": 7,
    "most_productive_hour": 10,
    "completion_rate": 85.0,
    "peak_productivity_day": "Tuesday"
}
```

### Productivity Dashboard
**GET** `/analytics/dashboard/`

**Response:**
```json
{
    "user_analytics": {...},
    "recent_insights": [...],
    "weekly_trends": [...],
    "focus_sessions_today": [...],
    "recommendations": [...]
}
```

### Generate AI Insights
**POST** `/analytics/generate-insights/`

**Response:**
```json
{
    "message": "AI insights generated successfully",
    "insight": {...},
    "analysis_result": {
        "productivity_score": 85,
        "completion_rate": "87%",
        "most_productive_time": "10:00 AM",
        "recommendations": [...]
    }
}
```

### AI Insights
**GET** `/analytics/insights/`

### AI Task Suggestions
**POST** `/analytics/suggestions/`

**Response:**
```json
{
    "suggestions": [
        "Review and organize your workspace",
        "Plan tomorrow's priorities",
        "Take a 15-minute break",
        "Update project status",
        "Clear your email inbox"
    ],
    "generated_at": "2025-06-25T10:30:00Z"
}
```

### Focus Sessions
**GET/POST** `/analytics/focus-sessions/`

**Request Body:**
```json
{
    "task": 1,
    "duration": 45,
    "start_time": "2025-06-25T10:00:00Z",
    "end_time": "2025-06-25T10:45:00Z",
    "focus_score": 8,
    "interruptions": 2,
    "mood_before": "focused",
    "mood_after": "accomplished"
}
```

---

## 📊 Subtasks & Comments

### Subtasks
**GET/POST** `/tasks/{task_id}/subtasks/`
**GET/PUT/DELETE** `/tasks/subtasks/{id}/`

### Comments
**GET/POST** `/tasks/{task_id}/comments/`

---

## 🔍 Filtering & Search

### Task Filtering
- `?priority=high` - Filter by priority
- `?status=completed` - Filter by status
- `?category=1` - Filter by category
- `?search=project` - Search in title/description
- `?ordering=-created_at` - Order by creation date (desc)

### Date Filtering
- `?due_date__gte=2025-06-25` - Tasks due after date
- `?completed_at__date=2025-06-25` - Tasks completed on date

---

## 📱 Mobile-Friendly Features

### Quick Actions
- Mark task complete: `POST /tasks/{id}/complete/`
- Get today's tasks: `GET /tasks/today/`
- Get user greeting: `GET /auth/greeting/`

### Offline Support
- All endpoints support standard HTTP caching headers
- Task data can be cached for offline access

---

## 🚀 AI Features Summary

1. **Productivity Analysis** - Analyzes completion patterns and provides scores
2. **Smart Recommendations** - AI-powered task suggestions based on patterns
3. **Time Management Insights** - Identifies most productive hours and days
4. **Mood Correlation** - Links mood with productivity levels
5. **Goal Tracking** - Tracks streaks and goal achievement
6. **Pattern Recognition** - Identifies work patterns and suggests improvements

---

## 📝 Response Formats

### Success Response
```json
{
    "data": {...},
    "message": "Success message"
}
```

### Error Response
```json
{
    "error": "Error description",
    "details": "Detailed error information"
}
```

### Pagination
```json
{
    "count": 100,
    "next": "http://api.example.com/tasks/?page=2",
    "previous": null,
    "results": [...]
}
```

---

## 🔒 Security Features

- JWT token authentication
- CORS protection for frontend integration
- Request rate limiting (to be implemented)
- Input validation and sanitization
- Secure password hashing

---

## 📚 Next Steps

1. Test all endpoints with your frontend
2. Implement real-time notifications
3. Add file upload capabilities
4. Integrate with calendar applications
5. Add team collaboration features
