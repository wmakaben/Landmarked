from flask import jsonify, make_response, request, json, abort, g, current_app
from app import app, db, auth
from .models import DecimalEncoder, User, Landmark
from dateutil import relativedelta
from datetime import timedelta
from functools import update_wrapper


def crossdomain(origin=None, methods=None, headers=None,
                max_age=21600, attach_to_all=True,
                automatic_options=True):
    if methods is not None:
        methods = ', '.join(sorted(x.upper() for x in methods))
    if headers is not None and not isinstance(headers, basestring):
        headers = ', '.join(x.upper() for x in headers)
    if not isinstance(origin, basestring):
        origin = ', '.join(origin)
    if isinstance(max_age, timedelta):
        max_age = max_age.total_seconds()

    def get_methods():
        if methods is not None:
            return methods

        options_resp = current_app.make_default_options_response()
        return options_resp.headers['allow']

    def decorator(f):
        def wrapped_function(*args, **kwargs):
            if automatic_options and request.method == 'OPTIONS':
                resp = current_app.make_default_options_response()
            else:
                resp = make_response(f(*args, **kwargs))
            if not attach_to_all and request.method != 'OPTIONS':
                return resp

            h = resp.headers
            h['Access-Control-Allow-Origin'] = origin
            h['Access-Control-Allow-Methods'] = get_methods()
            h['Access-Control-Max-Age'] = str(max_age)
            h['Access-Control-Allow-Credentials'] = 'true'
            h['Access-Control-Allow-Headers'] = \
                "Origin, X-Requested-With, Content-Type, Accept, Authorization"
            if headers is not None:
                h['Access-Control-Allow-Headers'] = headers
            return resp

        f.provide_automatic_options = False
        return update_wrapper(wrapped_function, f)
    return decorator

@app.errorhandler(404)
def not_found(error):
	return make_response(jsonify({'error' : 'Not found'}), 404)

@auth.verify_password
def verify_password(username_or_token, password):
	# first try to authenticate by token
	user = User.verify_auth_token(username_or_token)
	if not user:
		# try to authenticate with username/password
		user = User.query.filter_by(username=username_or_token).first()
	if not user or not user.verify_password(password):
		return False
	g.user = user
	return True

# Request Token
@app.route('/landmarked/api/v1.0/token', methods=['GET', 'POST'])
@auth.login_required
@crossdomain(origin='*')
def get_auth_token():
	token = g.user.generate_auth_token()
	return jsonify({ 'token': token.decode('ascii') })

# Make user
@app.route('/landmarked/api/v1.0/users', methods=['POST'])
def make_user():
	print 'yo'
	print request.form['first_name']
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
			user.hash_password(request.form['password'])
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
