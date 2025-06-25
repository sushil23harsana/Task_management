import google.generativeai as genai
from django.conf import settings
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any

class GeminiAnalytics:
    def __init__(self):
        genai.configure(api_key=settings.GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
    
    def analyze_task_productivity(self, user_tasks: List[Dict]) -> Dict[str, Any]:
        """
        Analyze user's task completion patterns and productivity
        """
        try:
            # Prepare task data for analysis
            task_summary = self._prepare_task_summary(user_tasks)
            
            prompt = f"""
            Analyze the following task management data and provide productivity insights:
            
            {task_summary}
            
            Please provide a JSON response with the following structure:
            {{
                "productivity_score": "number between 1-100",
                "completion_rate": "percentage of completed tasks",
                "most_productive_time": "time of day when most tasks are completed",
                "task_patterns": "observed patterns in task creation and completion",
                "recommendations": ["list of 3-5 actionable recommendations"],
                "weekly_trend": "upward/downward/stable",
                "focus_areas": ["areas that need improvement"]
            }}
            
            Keep recommendations practical and motivating.
            """
            
            response = self.model.generate_content(prompt)
            
            # Parse the response
            try:
                result = json.loads(response.text)
                return result
            except json.JSONDecodeError:
                # Fallback if JSON parsing fails
                return {
                    "productivity_score": 75,
                    "completion_rate": "Data analysis in progress",
                    "recommendations": ["Keep tracking your tasks consistently"],
                    "analysis_text": response.text
                }
                
        except Exception as e:
            return {
                "error": "Unable to generate analysis",
                "message": "Please try again later",
                "productivity_score": 0
            }
    
    def generate_task_suggestions(self, user_context: Dict) -> List[str]:
        """
        Generate AI-powered task suggestions based on user's patterns
        """
        try:
            prompt = f"""
            Based on the user's task management patterns, suggest 5 helpful tasks:
            
            User Context:
            - Recent tasks: {user_context.get('recent_tasks', [])}
            - Preferred categories: {user_context.get('categories', [])}
            - Time of day: {user_context.get('current_time', 'morning')}
            
            Return a simple list of 5 practical task suggestions that would be helpful.
            Format as a JSON array of strings.
            """
            
            response = self.model.generate_content(prompt)
            
            try:
                suggestions = json.loads(response.text)
                return suggestions if isinstance(suggestions, list) else []
            except:
                # Fallback suggestions
                return [
                    "Review and organize your workspace",
                    "Plan tomorrow's priorities",
                    "Take a 15-minute break",
                    "Update project status",
                    "Clear your email inbox"
                ]
                
        except Exception as e:
            return ["AI suggestions temporarily unavailable"]
    
    def _prepare_task_summary(self, tasks: List[Dict]) -> str:
        """
        Prepare task data summary for AI analysis
        """
        if not tasks:
            return "No tasks available for analysis"
        
        completed_tasks = [t for t in tasks if t.get('completed', False)]
        pending_tasks = [t for t in tasks if not t.get('completed', False)]
        
        summary = f"""
        Total Tasks: {len(tasks)}
        Completed: {len(completed_tasks)}
        Pending: {len(pending_tasks)}
        Completion Rate: {(len(completed_tasks) / len(tasks) * 100):.1f}%
        
        Recent Task Titles: {[t.get('title', '') for t in tasks[:10]]}
        """
        
        return summary
