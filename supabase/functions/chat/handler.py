import os
import json
from openai import OpenAI

def handle_chat(message, user_id):
    """Python handler for chat messages"""
    try:
        # Initialize OpenAI client
        api_key = os.environ.get("OPENAI_API_KEY")
        if not api_key:
            return {"error": "OPENAI_API_KEY is not set"}, 400
            
        client = OpenAI(api_key=api_key)
        
        # Call OpenAI API
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {
                    "role": "system",
                    "content": "You are a helpful assistant. Provide concise and accurate responses."
                },
                {
                    "role": "user",
                    "content": message
                }
            ],
            max_tokens=500,
            temperature=0.7,
            user=user_id
        )
        
        # Extract the response content
        ai_message = response.choices[0].message.content
        
        return {"message": ai_message}, 200
        
    except Exception as e:
        return {"error": str(e)}, 400

# This allows the function to be imported in other Python modules
if __name__ == "__main__":
    # For local testing
    import sys
    if len(sys.argv) > 1:
        test_message = sys.argv[1]
        result, _ = handle_chat(test_message, "test_user")
        print(json.dumps(result, indent=2))