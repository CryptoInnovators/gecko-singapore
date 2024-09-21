import os, sys

base_path = os.path.dirname(__file__)
library_path = os.path.join(base_path, "../")
sys.path.append(os.path.abspath(library_path))
from dotenv import load_dotenv

load_dotenv(os.path.abspath(os.path.join(base_path, ".env")))

OPNEAI_VERSION = 3
GPT4_API = os.getenv('OPENAI_API_KEY')
SEND_PRICE = 0.0015 / 1000
RECEIVE_PRICE = 0.002 / 1000
GPT4_SEND_PRICE = 0.03 / 1000
GPT4_RECEIVE_PRICE = 0.06 / 1000
