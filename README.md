# AI Task Management App - Backend

A powerful Django REST API backend for an AI-powered task management application with Google Gemini integration.

## 🚀 Features

### Core Features
- ✅ **User Authentication** with JWT tokens
- ✅ **Task Management** (CRUD operations)
- ✅ **Category & Priority System**
- ✅ **Calendar View Support**
- ✅ **Day Planner** functionality
- ✅ **Subtasks & Comments**
- ✅ **Dark/Light Theme** preferences

### AI-Powered Analytics
- 🤖 **Google Gemini AI Integration**
- 📊 **Productivity Analysis**
- 💡 **Smart Task Suggestions**
- 📈 **Performance Metrics**
- 🎯 **Personalized Recommendations**
- 📅 **Weekly Reports**
- ⏰ **Focus Session Tracking**

### Advanced Features
- 🔄 **Recurring Tasks**
- ⏰ **Time Tracking**
- 🏆 **Streak Tracking**
- 📱 **Responsive API Design**
- 🔍 **Advanced Filtering & Search**

## 📁 Project Structure

```
backend/
├── manage.py
├── requirements.txt
├── .env
├── task_management/         # Main project settings
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── accounts/               # User authentication
│   ├── models.py          # CustomUser model
│   ├── admin.py
│   └── views.py
├── tasks/                 # Task management
│   ├── models.py          # Task, Category, DayPlanner models
│   ├── admin.py
│   ├── views.py
│   └── management/
│       └── commands/
│           └── create_categories.py
├── analytics/             # AI analytics
│   ├── models.py          # Analytics, Insights, Predictions
│   ├── admin.py
│   ├── gemini_ai.py       # Google Gemini integration
│   └── views.py
└── venv/                  # Virtual environment
```

## 🛠 Installation & Setup

### 1. Environment Setup
Make sure you have PostgreSQL installed and running.

### 2. Install Dependencies
```bash
pip install -r requirements.txt
```

### 3. Environment Variables
Update your `.env` file with your actual values:
```env
SECRET_KEY=your-secret-key-here
DEBUG=True

# Database Settings
DB_NAME=task_management_db
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# Google Gemini AI API
GEMINI_API_KEY=your-gemini-api-key

# JWT Settings
JWT_SECRET_KEY=your-jwt-secret-key

# CORS Settings
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://127.0.0.1:3000
```

### 4. Database Setup
```bash
# Create and run migrations
python manage.py makemigrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Create initial categories
python manage.py create_categories
```

### 5. Run the Server
```bash
python manage.py runserver
```

## 📊 Database Models

### User Management
- **CustomUser**: Extended user model with theme preferences, timezone, avatar
- **UserAnalytics**: Comprehensive user performance tracking

### Task Management
- **Category**: Task categorization with colors and icons
- **Task**: Main task model with priority, status, dates, duration tracking
- **SubTask**: Subtask functionality
- **TaskComment**: Comments on tasks
- **DayPlanner**: Daily planning with mood tracking

### AI Analytics
- **WeeklyReport**: AI-generated weekly productivity reports
- **AIInsight**: Personalized insights and recommendations
- **TaskPrediction**: AI predictions for task completion
- **FocusSession**: Focus session tracking and analysis

## 🤖 AI Features with Google Gemini

### Analytics Capabilities
- **Productivity Analysis**: Analyzes task completion patterns
- **Smart Recommendations**: AI-powered suggestions for improvement
- **Time Pattern Recognition**: Identifies most productive hours
- **Completion Rate Tracking**: Performance metrics and trends
- **Mood Correlation**: Links mood with productivity

### Example AI Insights
- "You're 40% more productive in the morning"
- "Breaking large tasks into smaller ones increases your completion rate by 60%"
- "Your productivity peaks on Tuesdays and Wednesdays"

## 🔌 API Endpoints (To be implemented)

### Authentication
- `POST /api/auth/register/` - User registration
- `POST /api/auth/login/` - User login
- `POST /api/auth/refresh/` - Token refresh

### Tasks
- `GET /api/tasks/` - List tasks
- `POST /api/tasks/` - Create task
- `PUT /api/tasks/{id}/` - Update task
- `DELETE /api/tasks/{id}/` - Delete task

### Analytics
- `GET /api/analytics/dashboard/` - Get user analytics
- `GET /api/analytics/insights/` - Get AI insights
- `POST /api/analytics/focus-session/` - Log focus session

## 🎨 Frontend Integration

This backend is designed to work with a React + Vite frontend featuring:
- Clean, modern UI design
- Calendar view for task planning
- Dark/Light mode toggle
- AI analytics dashboard
- Day planner interface

## 🔒 Security Features

- JWT token authentication
- CORS protection
- Environment variable configuration
- Password validation
- Secure database configuration

## 📝 Next Steps

1. **Create API Views & Serializers**
2. **Implement URL routing**
3. **Add API documentation**
4. **Write unit tests**
5. **Deploy to production**

## 🤝 Contributing

This is a personal project, but contributions are welcome!

## 📄 License

This project is for educational and personal use.
