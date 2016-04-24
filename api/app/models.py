from app import app, db
from flask import json
import datetime, decimal
from dateutil import relativedelta
from passlib.apps import custom_app_context as pwd_context
from itsdangerous import Serializer, SignatureExpired, BadSignature

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, decimal.Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)

follower = db.Table('Follower',
	db.Column('follower_id', db.Integer, db.ForeignKey('User.id')),
	db.Column('followed_id', db.Integer, db.ForeignKey('User.id')))

class User(db.Model):
	__tablename__ = 'User'
	id = db.Column(db.Integer, primary_key=True)
	first_name = db.Column(db.String(50))
	last_name = db.Column(db.String(50))
	username = db.Column(db.String(20), index=True, unique=True)
	phone = db.Column(db.String(20))
	password_hash = db.Column(db.String(128))

	landmarks = db.relationship('Landmark', backref=db.backref('User'))

	following = db.relationship(
		'User',
		secondary=follower,
		primaryjoin=id==follower.c.follower_id,
		secondaryjoin=id==follower.c.followed_id,
		backref="followers")

	received_challenges = db.relationship(
		'LandmarkChallenge',
		backref='Recipient',
		lazy='dynamic',
		foreign_keys = 'LandmarkChallenge.recipient')

	sent_challenges = db.relationship(
		'LandmarkChallenge',
		backref='Sender',
		lazy='dynamic',
		foreign_keys = 'LandmarkChallenge.sender')

	def __init__(self, first_name, last_name, username, phone, password):
		self.first_name = first_name
		self.last_name = last_name
		self.username = username
		self.phone = phone
		self.hash_password(password)

	def hash_password(self, password):
		self.password_hash = pwd_context.encrypt(password)
	
	def verify_password(self, password):
		return pwd_context.verify(password, self.password_hash)

	def generate_auth_token(self):
		s = Serializer(app.config['SECRET_KEY'])
		return s.dumps({'id': self.id})

	@staticmethod
	def verify_auth_token(token):
		s = Serializer(app.config['SECRET_KEY'])
		try:
			data = s.loads(token)
		except SignatureExpired:
			return None    # valid token, but expired
		except BadSignature:
			return None    # invalid token
		user = User.query.get(data['id'])
		return user

	def to_json(self):
		json = {'id': self.id,
				'first_name': self.first_name,
				'last_name': self.last_name,
				'username': self.username,
				'phone': self.phone}
		return json

	def __repr__(self):
		return ('<User id %i, first_name %s, last_name %s, username %s, phone %s>'
                % (self.id, self.first_name, self.last_name, self.username, self.phone,))

class Landmark(db.Model):
	__tablename__ = 'Landmark'
	id = db.Column(db.Integer, primary_key=True)
	location_name = db.Column(db.String(50))
	latitude = db.Column(db.Numeric(10,8))
	longitude = db.Column(db.Numeric(11,8))
	description = db.Column(db.String(100))
	date_created = db.Column(db.DateTime(), default=datetime.date.today())
	date_expiration = db.Column(db.DateTime())
	# expiration default = datetime.date.today() + relativedelta.relativedelta(months=1)
	status = db.Column(db.Integer)
	creator = db.Column(db.Integer, db.ForeignKey('User.id'))

	def to_json(self):
		json = {'id': self.id,
				'location_name': self.location_name,
				'latitude': self.latitude,
				'longitude': self.longitude,
				'description': self.description,
				'date_created': self.date_created,
				'date_expiration': self.date_expiration,
				'status': self.status,
				'creator': self.creator}
		return json

	challenges = db.relationship(
		'LandmarkChallenge',
		backref='Landmarks',
		lazy='dynamic',
		foreign_keys = 'LandmarkChallenge.landmark')

	# TODO: __repr__ function

class LandmarkChallenge(db.Model):
	__tablename__ = 'LandmarkChallenge'
	id = db.Column(db.Integer, primary_key=True)
	status = db.Column(db.Integer)
	sender = db.Column(db.Integer, db.ForeignKey('User.id'))
	recipient = db.Column(db.Integer, db.ForeignKey('User.id'))
	landmark = db.Column(db.Integer, db.ForeignKey('Landmark.id'))

	db.UniqueConstraint('sender', 'recipient', 'landmark')

	def to_json(self):
		json = {'id': self.id,
				'status': self.location_name,
				'sender': self.sender,
				'recipient': self.recipient,
				'landmark': self.landmark}
		return json




