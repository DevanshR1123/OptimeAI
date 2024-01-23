from flask import Flask, jsonify, request
from flask_cors import CORS
from llm.llm import call_scheduler

app = Flask(__name__)

CORS(app)


@app.route("/")
def index():
    return "Hello from OptimeAI"


@app.post("/schedule")
def llm():
    prompt_input = request.json["command"]
    context = request.json["context"]
    llm_output = call_scheduler(prompt_input, context)
    return jsonify(llm_output)


# if __name__ == "__main__":
#     app.run(host="0.0.0.0", port=80, debug=True)
