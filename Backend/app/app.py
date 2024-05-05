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
        token = request.json["token"]
        calendar_id = request.json["calendar_id"]
        name = request.json["name"]
        time_zone = request.json["time_zone"]

        llm_output = call_scheduler(prompt_input, context, token, calendar_id, time_zone, name)
        return jsonify(llm_output)

    except Exception as e:
        return jsonify({"error": str(e)})
