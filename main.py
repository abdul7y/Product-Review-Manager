"""
This file serves as a bridge to start the Node.js Express application.
It's used to comply with the workflow configuration.
"""

import os
import signal
import subprocess
import sys
import time
from flask import Flask, redirect

# Create a minimal Flask app for the gunicorn setup
# This app does nothing but keep the gunicorn worker alive
app = Flask(__name__)

@app.route('/')
def home():
    return redirect('http://localhost:3000')

@app.route('/<path:path>')
def proxy(path):
    return redirect(f'http://localhost:3000/{path}')

# Start Express.js in a subprocess
def start_express():
    # Modify app.js to use port 3000 instead of 5000
    try:
        with open('app.js', 'r') as f:
            content = f.read()
        
        # Change the port from 5000 to 3000
        if 'const PORT = process.env.PORT || 5000;' in content:
            content = content.replace('const PORT = process.env.PORT || 5000;', 
                                     'const PORT = process.env.PORT || 3000;')
            
            with open('app.js', 'w') as f:
                f.write(content)
    except Exception as e:
        print(f"Error modifying app.js: {e}")
    
    # Start the Express application
    print("Starting Express.js application on port 3000...")
    
    try:
        # Start Express in a subprocess
        process = subprocess.Popen(
            ['node', 'app.js'],
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            preexec_fn=os.setsid  # Create a new process group
        )
        
        # Output the logs from Express
        while True:
            line = process.stdout.readline()
            if not line and process.poll() is not None:
                break
            print(line, end='')
            sys.stdout.flush()
            
    except Exception as e:
        print(f"Error starting Express: {e}")

# Start Express in a separate process when running under gunicorn
import threading
express_thread = threading.Thread(target=start_express)
express_thread.daemon = True
express_thread.start()