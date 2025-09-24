import requests
from litellm import completion
import os
import litellm

litellm._turn_on_debug()

with open("API_KEY.txt", 'r') as f:
    # os.environ["OPENAI_API_KEY"] = f.read()
    os.environ["GEMINI_API_KEY"] = f.read()

def get_llm_summary(website_content):
    response = completion(
        model="gemini/gemini-2.0-flash",
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": "Generate a roughly 50-word summary of this website: " + website_content}
        ]
    )

    return response["choices"][0]["message"]["content"]
    
def get_summary(url):
    """
    Fetches the content of a website and returns the first 10 characters.
    
    Args:
        url (str): The URL of the website.
        
    Returns:
        str: The first 10 characters of the website's HTML content.
    """
    try:
        response = requests.get(url)
        # Raise an exception for bad status codes (4xx or 5xx)
        response.raise_for_status() 
        
        # Return the first 10 characters of the content
        # response.text
        return get_llm_summary(response.text)
        
    except requests.exceptions.RequestException as e:
        # Handle network errors, invalid URLs, etc.
        return f"Error: {e}"

# Example usage:
if __name__ == '__main__':
    test_url = "https://www.google.com"
    summary = get_summary(test_url)
    print(f"Summary for {test_url}: {summary}")