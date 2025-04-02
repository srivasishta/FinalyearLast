from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import time
from datetime import datetime
import pytz

app = Flask(__name__)
CORS(app)

OLLAMA_API_URL = "http://localhost:11434/api/generate"  # Ollama Mistral API endpoint

# 🔹 SYSTEM PROMPT for Mistral AI
SYSTEM_PROMPT = """You are an advanced AI assistant designed to provide intelligent, context-aware, and human-like conversations. Your primary goal is to engage users effectively, understand their intent, and provide accurate, concise, and helpful responses. Responses should be relevant to mental health and academics only.

Core principles to follow in every response:

1. Conversational Flow & Memory:
- Maintain coherent multi-turn conversations
- Consider context from previous exchanges
- Adapt to user preferences and tone

2. Human-Like Interaction:
- Use natural, varied language
- Be engaging and empathetic while professional
- Match user sentiment appropriately

3. Accuracy & Relevance:
- Provide fact-based, current information
- Verify before responding
- Ask for clarification when needed
- Ensure responses are relevant to mental health and academics only

4. Personalization:
- Recognize preferences and patterns
- Offer tailored suggestions
- Adapt to user needs

5. Task Execution:
- Provide clear, structured responses
- Include step-by-step explanations when needed
- Balance detail with brevity

6. Creative & Analytical Thinking:
- Generate unique solutions
- Provide thoughtful analysis
- Support ideation logically

7. Ethical & Safe Use:
- Avoid harmful or misleading content
- Respect privacy
- Maintain constructive dialogue

8. Technical Capabilities:
- Support multiple languages
- Optimize response time
- Maintain integration compatibility

"I'm Vishwakarm.ai, named after Vishwakarma, the architect of gods, who is known for his incredible craftsmanship and creative prowess. I’m here to assist you with your questions and provide helpful information. How can I help you today?"

When asked about your identity, such as "Who are you?" or "What is your name?", respond in a friendly and generic manner without revealing your name or company name. Emphasize your role as an assistant and your purpose to help. 

Remember to be concise yet thorough in less than 800 words, professional yet friendly, and always focus on providing value to the user."""

# 🔹 Dictionary to store conversation history for each session
conversation_history = {}

def get_greeting(user_timezone="UTC"):
    """Returns a greeting based on the user's local time."""
    try:
        tz = pytz.timezone(user_timezone)
        current_hour = datetime.now(tz).hour
    except pytz.UnknownTimeZoneError:
        current_hour = datetime.now().hour  # Fallback to server time

    if current_hour < 12:
        return "Good morning! ☀️"
    elif current_hour < 18:
        return "Good afternoon! 😊"
    else:
        return "Good evening! 🌙"

def chat_with_ollama(user_input, session_id):
    """Sends user input to Mistral AI along with the system prompt."""
    
    if session_id not in conversation_history:
        # Initialize session with the system prompt
        conversation_history[session_id] = [{"role": "system", "content": SYSTEM_PROMPT}]

    # Add user message to history
    conversation_history[session_id].append({"role": "user", "content": user_input})

    # Construct full conversation history as a prompt
    formatted_prompt = "\n".join([msg["content"] for msg in conversation_history[session_id]])

    # Request payload with full conversation history
    payload = {
        "model": "mistral",
        "prompt": formatted_prompt,  # **System prompt + user history**
        "stream": False
    }

    # Send request to Mistral AI
    try:
        response = requests.post(OLLAMA_API_URL, json=payload)
        response_data = response.json()

        # Extract response text
        ai_response = response_data.get("response", "I'm sorry, I couldn't process that.")

        # Append AI response to chat history
        conversation_history[session_id].append({"role": "assistant", "content": ai_response})

        return ai_response

    except requests.exceptions.RequestException as e:
        return f"Error connecting to Ollama: {str(e)}"

@app.route('/chat', methods=['POST'])
def chat():
    """Handles user messages and returns AI responses."""
    try:
        data = request.json
        user_input = data.get('message')
        session_id = data.get('sessionId')
        user_timezone = data.get('timezone', 'UTC')  # Default to UTC

        if not user_input or not session_id:
            return jsonify({"response": "Invalid request.", "status": "error"}), 400

        # Get AI response
        ai_response = chat_with_ollama(user_input, session_id)

        return jsonify({
            "response": ai_response,
            "status": "success"
        }), 200  # Ensure a valid JSON response
        
    except Exception as e:
        return jsonify({
            "response": f"An error occurred: {str(e)}",
            "status": "error"
        }), 500

@app.route('/clear-chat', methods=['POST'])
def clear_chat():
    """Clears chat history for a session."""
    try:
        data = request.json
        session_id = data.get('sessionId')
        if session_id in conversation_history:
            del conversation_history[session_id]
        return jsonify({"status": "success", "message": "Chat history cleared"})
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 500
    
@app.route("/refresh", methods=["POST"])
def refresh_conversation():
    """Resets conversation history for a user session."""
    session_id = request.json.get("session_id")
    if session_id in conversation_history:
        del conversation_history[session_id]
    return {"message": "Conversation reset successfully."}, 200

if __name__ == '__main__':
    time.sleep(2)  # Optional: Wait for the server to be ready
    app.run(debug=True, port=5000)
