from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy
from flask.ext.httpauth import HTTPBasicAuth
# TODO: Remove at some point
from flask.ext.cors import CORS

app = Flask(__name__)
app.config.from_object('config')
app.secret_key = 'OjFH\xe0\xba\x82\x08p\x19\xd4})#\x9b\xb5n\xae\xa9g\x8f\xa4\x10\xaf'
# TODO: see if still needed
CORS(app)
db = SQLAlchemy(app)
auth = HTTPBasicAuth()

from app import routes, models