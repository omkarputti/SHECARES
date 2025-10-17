import google.generativeai as genai
import os

genai.configure(api_key=os.getenv("AIzaSyCjiCyON4HkTRufan3_JdZv75vacNMOmuY"))

for m in genai.list_models():
    if "generateContent" in m.supported_generation_methods:
        print(m.name)