from flask import Flask, request, jsonify
from flask_cors import CORS
import api

app = Flask(__name__)
CORS(app)

@app.route('/getSummary', methods=['POST'])
def get_summary():
    """
    Handles a POST request to generate a summary.
    """
    try:
        # Get the JSON data from the request body
        data = request.get_json()
        
        # Extract the 'url' from the JSON data
        url = data.get('url')
        wordCount = data.get('wordCount')

        # Check if the URL was provided
        if not url:
            return jsonify({'error': 'URL not provided'}), 400

        # Create the summary text
        info = api.get_info(url, summary_length=wordCount)
        # title = info["title"]
        # summary_text = info["summary"]

        # Return a JSON response with the summary
        return jsonify(info)

    except Exception as e:
        # Handle any errors during the request
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    # Run the server on localhost at port 3000
    app.run(host='127.0.0.1', port=3000, debug=True)