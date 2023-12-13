from flask import Flask, render_template, request, jsonify
from llm import call_scheduler
from flask_cors import CORS

app = Flask(__name__)

CORS(app)


@app.post("/schedule")
def llm():
    prompt_input = request.json["command"]
    # context = request.json["context"]
    llm_output = call_scheduler(prompt_input)
    return jsonify(llm_output)


if __name__ == "__main__":
    app.run(debug=True)
