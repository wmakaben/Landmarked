from flask import jsonify, make_response, request, json, abort
from app import app, db
from .models import DecimalEncoder, User, Landmark
import datetime
from dateutil import relativedelta

@app.errorhandler(404)
def not_found(error):
	return make_response(jsonify({'error' : 'Not found'}), 404)

# Make user
@app.route('/landmarked/api/v1.0/users', methods=['POST'])
def make_user():
	user = User(first_name = request.form['first_name'],
				last_name = request.form['last_name'],
				username = request.form['username'],
				phone = request.form['phone'],
				password = request.form['password'])
	db.session.add(user)
	db.session.commit()
	return json.dumps({'status' : 'OK', 'user' : user.to_json()})

# Get user
@app.route('/landmarked/api/v1.0/users/<user>', methods=['GET'])
def get_user_username(user):
	user = User.query.filter_by(username=user).first()
	if user is None:
		abort(404)
	else:
		return jsonify(user.to_json())

# Update user
@app.route('/landmarked/api/v1.0/users/<int:user_id>', methods=['POST'])
def update_user(user_id):
	user = User.query.filter_by(id=user_id).first()
	if user is None:
		abort(404)
	else:
		form = request.form.keys()
		# Check for form keys and update keys that exist
		if 'first_name' in form:
			user.first_name = request.form['first_name']
		if 'last_name' in form:
			user.last_name = request.form['last_name']
		if 'username' in form:
			user.username = request.form['username']
		if 'phone' in form:
			user.phone = request.form['phone']
		if 'password' in form:
			user.set_password(request.form['password'])
		db.session.commit()
		return json.dumps({'status': 'OK', 'user': user.to_json()})

# Delete user
@app.route('/landmarked/api/v1.0/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
	user = User.query.filter_by(id=user_id).first()
	if user is None:
		abort(404)
	else:
		db.session.delete(user)
		db.session.commit()
		return json.dumps({'status':'OK', 'deleted':'true'})

# Create Landmark
@app.route('/landmarked/api/v1.0/landmarks', methods=['POST'])
def make_landmark():
	landmark = Landmark(
				location_name = request.form['location_name'],
				latitude = request.form['latitude'],
				longitude = request.form['longitude'],
				description = request.form['description'],
				creator = request.form['creator'],
				date_created = datetime.datetime.now(),
				status = 0)

	if 'date_expiration' in request.form.keys():
		landmark.date_expiration = request.form['date_expiration']
	else:
		landmark.date_expiration = datetime.datetime.now() + relativedelta.relativedelta(months=1)

	db.session.add(landmark)
	db.session.commit()
	return json.dumps({'status' : 'OK', 'landmark' : landmark.to_json()}, cls=DecimalEncoder)

# Get landmark
@app.route('/landmarked/api/v1.0/landmarks/<int:landmark_id>', methods=['GET'])
def get_landmark(landmark_id):
	landmark = Landmark.query.filter_by(id=landmark_id).first()
	if landmark is None:
		abort(404)
	else:
		return json.dumps(landmark.to_json(), cls=DecimalEncoder)

# Gets landmarks by user
@app.route('/landmarked/api/v1.0/landmarks/user/<int:user_id>', methods=['GET'])
def get_user_landmarks(user_id):
	user = User.query.filter_by(id=user_id).first()
	if user is None:
		abort(404)
	else:
		landmarks = []
		for l in user.landmarks:
			landmarks.append(l.to_json())
		return json.dumps({'status':'OK', 'landmarks':landmarks}, cls=DecimalEncoder)

# Update landmark
@app.route('/landmarked/api/v1.0/landmarks/<int:landmark_id>', methods=['POST'])
def update_landmark(landmark_id):
	landmark = Landmark.query.filter_by(id=landmark_id).first()
	if landmark is None:
		abort(404)
	else:
		form = request.form.keys()
		# Check for form keys and update keys that exist
		if 'status' in form:
			landmark.status = request.form['status']
		if 'date_expiration' in form:
			landmark.date_expiration = request.form['date_expiration']
		db.session.commit()
		return json.dumps({'status': 'OK', 'landmark': landmark.to_json()}, cls=DecimalEncoder)

# Delete landmark
@app.route('/landmarked/api/v1.0/landmarks/<int:landmark_id>', methods=['DELETE'])
def delete_landmark(landmark_id):
	landmark = Landmark.query.filter_by(id=landmark_id).first()
	if landmark is None:
		abort(404)
	else:
		db.session.delete(landmark)
		db.session.commit()
		return json.dumps({'status':'OK', 'deleted':'true'})

# Get list of users that a user is following
@app.route('/landmarked/api/v1.0/following/<int:user_id>', methods=['GET'])
def get_followed(user_id):
	user = User.query.filter_by(id=user_id).first()
	if user is None:
		abort(404)
	else:
		following = []
		for f in user.following:
			following.append({'id':f.id, 'username':f.username, 'first_name':f.first_name, 'last_name':f.last_name})
		return json.dumps({'status':'OK', 'following':following})

# Get list of users that a user is following
@app.route('/landmarked/api/v1.0/followers/<int:user_id>', methods=['GET'])
def get_followers(user_id):
	user = User.query.filter_by(id=user_id).first()
	if user is None:
		abort(404)
	else:
		followers = []
		for f in user.followers:
			followers.append({'id':f.id, 'username':f.username, 'first_name':f.first_name, 'last_name':f.last_name})
		return json.dumps({'status':'OK', 'followers':followers})

# Add follower connection
@app.route('/landmarked/api/v1.0/followers', methods=['POST'])
def add_follower():
	follower = User.query.filter_by(id=request.form['follower_id']).first()
	followed = User.query.filter_by(id=request.form['followed_id']).first()
	if follower is None or followed is None:
		abort(404)
	else:
		follower.following.append(followed)
		db.session.commit()
		return json.dumps({'status' : 'OK'})

# Unfollow
@app.route('/landmarked/api/v1.0/followers', methods=['DELETE'])
def unfollow():
	follower = User.query.filter_by(id=request.form['follower_id']).first()
	followed = User.query.filter_by(id=request.form['followed_id']).first()
	if follower is None or followed is None:
		abort(404)
	else:
		follower.following.remove(followed)
		db.session.commit()
		return json.dumps({'status':'OK'})


@app.route('/landmarked/api/v1.0/landmarks/received/<int:user_id>', methods=['GET'])
def get_received_challenges(user_id):
	user = User.query.filter_by(id=user_id).first()
	print user.received_challenges
	return 'yo'



'''
TODO
get user's landmark stats
get user autocomplete
make sure duplicates of relationships can't be added
'''
