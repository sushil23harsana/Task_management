import requests
from django.conf import settings
import json
from datetime import datetime, timedelta
from typing import Dict, List, Any

class MistralAnalytics:
    def __init__(self):
        self.api_key = settings.MISTRAL_API_KEY
        self.base_url = "https://api.mistral.ai/v1"
        self.model = "mistral-large-latest"  # or "mistral-medium" for cost efficiency
        
    def _make_api_request(self, messages: List[Dict]) -> str:
        """
        Make a request to Mistral API
        """
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 1000
        }
        
        response = requests.post(
            f"{self.base_url}/chat/completions",
            headers=headers,
            json=payload
        )
        
        if response.status_code == 200:
            return response.json()["choices"][0]["message"]["content"]
        else:
            raise Exception(f"Mistral API error: {response.status_code} - {response.text}")
    
    def analyze_task_productivity(self, user_tasks: List[Dict]) -> Dict[str, Any]:
        """
        Analyze user's task completion patterns and productivity
        """
        try:
            # Prepare task data for analysis
            task_summary = self._prepare_task_summary(user_tasks)
            
            messages = [
                {
                    "role": "system",
                    "content": "You are a productivity analyst. Analyze task management data and provide insights in JSON format."
                },
                {
                    "role": "user",
                    "content": f"""
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
                    
                    Keep recommendations practical and motivating. Respond with valid JSON only.
                    """
                }
            ]
            
            response_text = self._make_api_request(messages)
            
            # Parse the response
            try:
                result = json.loads(response_text)
                return result
            except json.JSONDecodeError:
                # Try to extract JSON from response if it's wrapped in text
                import re
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group())
                    return result
                else:
                    # Fallback if JSON parsing fails
                    return {
                        "productivity_score": 75,
                        "completion_rate": "Data analysis in progress",
                        "recommendations": ["Keep tracking your tasks consistently"],
                        "analysis_text": response_text
                    }
                
        except Exception as e:
            return {
                "error": "Unable to generate analysis",
                "message": f"Error: {str(e)}",
                "productivity_score": 0
            }
    
    def generate_task_suggestions(self, user_context: Dict) -> List[str]:
        """
        Generate AI-powered task suggestions based on user's patterns
        """
        try:
            messages = [
                {
                    "role": "system",
                    "content": "You are a productivity assistant. Generate helpful task suggestions based on user patterns."
                },
                {
                    "role": "user",
                    "content": f"""
                    Based on the user's task management patterns, suggest 5 helpful tasks:
                    
                    User Context:
                    - Recent tasks: {user_context.get('recent_tasks', [])}
                    - Preferred categories: {user_context.get('categories', [])}
                    - Time of day: {user_context.get('current_time', 'morning')}
                    
                    Return a JSON array of 5 practical task suggestions that would be helpful.
                    Format: ["task 1", "task 2", "task 3", "task 4", "task 5"]
                    Respond with valid JSON array only.
                    """
                }
            ]
            
            response_text = self._make_api_request(messages)
            
            try:
                suggestions = json.loads(response_text)
                return suggestions if isinstance(suggestions, list) else []
            except:
                # Try to extract JSON array from response
                import re
                json_match = re.search(r'\[.*\]', response_text, re.DOTALL)
                if json_match:
                    suggestions = json.loads(json_match.group())
                    return suggestions if isinstance(suggestions, list) else []
                else:
                    # Fallback suggestions
                    return [
                        "Review and organize your workspace",
                        "Plan tomorrow's priorities",
                        "Take a 15-minute break",
                        "Update project status",
                        "Clear your email inbox"
                    ]
                
        except Exception as e:
            return [f"AI suggestions temporarily unavailable: {str(e)}"]
    
    def generate_insights(self, user_data: Dict) -> Dict[str, Any]:
        """
        Generate comprehensive insights about user's productivity patterns
        """
        try:
            messages = [
                {
                    "role": "system",
                    "content": "You are an AI productivity coach. Analyze user data and provide personalized insights."
                },
                {
                    "role": "user",
                    "content": f"""
                    Analyze this user's productivity data and generate insights:
                    
                    User Data: {json.dumps(user_data, indent=2)}
                    
                    Generate 2-3 actionable insights with titles and detailed explanations.
                    Format as JSON:
                    {{
                        "insights": [
                            {{
                                "title": "Insight title",
                                "content": "Detailed explanation with actionable advice",
                                "confidence_score": 0.85,
                                "insight_type": "productivity/time_management/goal_setting"
                            }}
                        ]
                    }}
                    
                    Respond with valid JSON only.
                    """
                }
            ]
            
            response_text = self._make_api_request(messages)
            
            try:
                result = json.loads(response_text)
                return result
            except json.JSONDecodeError:
                # Try to extract JSON from response
                import re
                json_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if json_match:
                    result = json.loads(json_match.group())
                    return result
                else:
                    return {
                        "insights": [
                            {
                                "title": "Keep Building Momentum",
                                "content": "Continue tracking your tasks to build better productivity insights over time.",
                                "confidence_score": 0.8,
                                "insight_type": "productivity"
                            }
                        ]
                    }
                    
        except Exception as e:
            return {
                "insights": [
                    {
                        "title": "Insights Temporarily Unavailable",
                        "content": f"Unable to generate insights at this time: {str(e)}",
                        "confidence_score": 0.0,
                        "insight_type": "system"
                    }
                ]
            }
    
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
