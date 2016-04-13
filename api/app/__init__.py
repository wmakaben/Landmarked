from flask import Flask
from flask.ext.sqlalchemy import SQLAlchemy

app = Flask(__name__)
app.config.from_object('config')
app.secret_key = 'OjFH\xe0\xba\x82\x08p\x19\xd4})#\x9b\xb5n\xae\xa9g\x8f\xa4\x10\xaf'
db = SQLAlchemy(app)

from app import routes, models