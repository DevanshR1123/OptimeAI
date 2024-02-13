from flask import Flask, jsonify, request
from flask_cors import CORS
from app.scheduler import call_scheduler

app = Flask(__name__)

CORS(app)


@app.route("/")
def index():
    return "Hello from OptimeAI"


@app.post("/schedule")
def llm():
    try:
        prompt_input = request.json["command"]
        context = request.json["context"]

        llm_output = call_scheduler(prompt_input, context)
        return jsonify(llm_output)

    except Exception as e:
        return jsonify({"error": str(e)})
