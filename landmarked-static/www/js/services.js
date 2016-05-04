angular.module('starter.services', ['starter.constants'])

// TODO: replace with user auth token
.factory('UserAccount', function(Users){
	var user;

	return {
		login: function(username){
			user = Users.get_by_username(username);
			return user;
		},
		logout: function(){
			user = null;
		},
		get: function(){
			return user;
		}
	}
})


// TODO: all add and remove methods

.factory('GeoService', function($ionicLoading, $ionicPopup){
	console.log('GeoAlert service instantiated');
	// Callback function after retrieving location
	var callback;
	// Variables for target landmarks
	var challenges, landmark;
	var coordinates;

	// https://www.geodatasource.com/developers/javascript
	// Gets distance between coordinate points
  	function getDistance(lat1, lon1, lat2, lon2, unit){
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344; }
		if (unit=="N") { dist = dist * 0.8684; }
		return dist;
  	};

	// options for geolocation service
	var options = {
		enableHighAccuracy: true,
		timeout: 5000,
		maximumAge: 0
	};

	// Geolocation error
	function error(err){
		console.warn('Error(' + err.code + '): ' + err.message);
		$ionicLoading.hide();

		// TODO: test
		var alertPopup = $ionicPopup.alert({
			title: 'Unable to retrieve location',
			template: 'Pull down to refresh'
		});

		alertPopup.then(function(res) {
			console.log('Unable to retrieve location');
		});
    };

    // Geolocation success (add distances to challenges)
    function getChallengeDistances(pos){
    	var lat1 = pos.coords.latitude;
    	var lon1 = pos.coords.longitude;

    	console.log('Current Position');
    	console.log('Latitude: ' + lat1);
    	console.log('Longitude: ' + lon1);

    	// Get distance for pending challenges
    	for(c of challenges.pending){
    		var lat2 = c.landmark.latitude;
    		var lon2 = c.landmark.longitude;
    		var d = parseFloat(getDistance(lat1, lon1, lat2, lon2).toFixed(2));
    		if(d > 10)
    			d = parseInt(d);
    		c.distance = d;
    	}

    	// Get distance for local landmarks
    	for(c of challenges.local){   		
    		var d = parseFloat(getDistance(lat1, lon1, c.latitude, c.longitude).toFixed(2));
    		if(d > 10)
    			d = parseInt(d);
    		c.distance = d;
    	}

    	// Callback
    	if(callback)
    		callback();
    };

    // Geolocation success (return distance from )
    function getTargetDistance(pos){
    	var lat1 = pos.coords.latitude;
    	var lon1 = pos.coords.longitude;
    	var lat2 = landmark.latitude;
		var lon2 = landmark.longitude;

   		d = parseFloat(getDistance(lat1, lon1, lat2, lon2).toFixed(2));
   		if(d > 10)
   			d = parseInt(d);
   		
   		landmark.distance = d;
   		callback();
    }


	return {
		get_distances: function(c, cb, s){
			challenges = c;
			callback = cb;
			if(s)
				s();
			navigator.geolocation.getCurrentPosition(getChallengeDistances, error, options);
			return challenges;
		},
		get_distance: function(l, cb, s){
			landmark = l;
			callback = cb;
			if(s)
				s();
			navigator.geolocation.getCurrentPosition(getTargetDistance, error, options);
			return landmark;
		},
		get_location: function(){
			$ionicLoading.show({
				content: 'Loading',
				animation: 'fade-in',
				showBackdrop: true,
				maxWidth: 200,
				showDelay: 0
			});

			navigator.geolocation.getCurrentPosition(function(pos){
				coordinates = pos;
				$ionicLoading.hide();
			}, error, options);	
			return coordinates;		
		}
	};
})

.factory('Users', function(){
	var users = [{
		id: 1,
		first_name: 'Landmarked',
		last_name: '',
		username: 'Landmarked'
	}, {
		id: 2,
		first_name: 'Will',
		last_name: 'Makabenta',
		username: 'wmakaben'
	}, {
		id: 3,
		first_name: 'Chris',
		last_name: 'Walker',
		username: 'cwalker'
	}, {
		id: 4,
		first_name: 'Jon',
		last_name: 'Mize',
		username: 'jmize'
	}, {
		id: 5,
		first_name: 'Scott',
		last_name: 'Michener',
		username: 'smichener'
	}, {
		id: 6,
		first_name: 'Ryan',
		last_name: 'Bauman',
		username: 'rbauman'
	}, {
		id: 7,
		first_name: 'Lucas',
		last_name: 'Mckeon',
		username: 'lmckeon'
	}];

	return {
		remove: function(user){
			users.splice(users.indexOf(user), 1);
		},
		get: function(userId){
			for(u of users){
				if(u.id == parseInt(userId))
					return u
			}			
			return null;
		},
		get_by_username: function(username){
			for(u of users){
				if(u.username == username)
					return u
			}			
			return null;
		},
		// Returns a list of usernames containing a given search phrase
		search: function(username, userId){
			var search = []
			for(u of users){
				if(u.username.toLowerCase().indexOf(username.toLowerCase()) > -1 && u.id != userId)
					search.push(u);
			}
			return search
		}
	}
})

.factory('Landmarks', function(Users){
	var landmarks = [{
		id: 1,
		location_name: 'Villanova University',
		latitude: 40.037222,
		longitude: -75.349167,
		description: 'Check out the home of the 2016 NCAA Mens Basketball Champs',
		creator_id: 5,
		creator: Users.get(5),
		date_created: formatDate(new Date()),
		date_expiration: null,
		status: 1,
		discover_radius: 0
	}, {
		id: 2,
		location_name: 'Campus Corner',
		latitude: 40.0359449,
		longitude: -75.34767339999996,
		description: 'Try their new burger',
		creator_id: 3,
		creator: Users.get(3),
		date_created: formatDate(new Date()),
		date_expiration: null,
		status: 1,
		discover_radius: 0
	}, {
		id: 3,
		location_name: 'Pinnacle Hiking Trail',
		latitude: 40.583229,
		longitude: -75.941910,
		description: 'Make it to the Pinnacle viewpoint',
		creator_id: 2,
		creator: Users.get(2),
		date_created: formatDate(new Date()),
		date_expiration: null,
		status: 1,
		discover_radius: 0
	}, {
		id: 4,
		location_name: 'My House',
		latitude: 40.0244978,
		longitude: -75.2119462,
		description: 'Try my first attempt at brewing beer',
		creator_id: 2,
		creator: Users.get(2),
		date_created: formatDate(new Date()),
		date_expiration: formatDate(new Date()),
		status: 1,
		discover_radius: 0
	}, {
		id: 5,
		location_name: 'Dalessandro\'s Steaks',
		latitude: 40.0295457,
		longitude: -75.205888,
		description: 'Try a Cheesesteak',
		creator_id: 4,
		creator: Users.get(4),
		date_created: formatDate(new Date()),
		date_expiration: formatDate(new Date()),
		status: 1,
		discover_radius: 0
	}, {
		id: 6,
		location_name: 'Villanova, Mendel 296',
		latitude: 40.0379563,
		longitude: -75.3424296,
		description: 'Check out the demo for Landmarked',
		creator_id: 1,
		creator: Users.get(1),
		date_created: formatDate(new Date()),
		date_expiration: null,
		status: 1,
		discover_radius: 0
	}, {
		id: 7,
		location_name: 'Deke\'s BBQ',
		latitude: 40.0244978,
		longitude: -75.2119462,
		description: 'Get some ribs',
		creator_id: 1,
		creator: Users.get(1),
		date_created: formatDate(new Date()),
		date_expiration: null,
		status: 2,
		discover_radius: 30
	}, {
		id: 8,
		location_name: 'Wells Fargo Center',
		latitude: 39.901111,
		longitude: -75.171944,
		description: 'Watch the Flyers play',
		creator_id: 1,
		creator: Users.get(1),
		date_created: formatDate(new Date()),
		date_expiration: null,
		status: 2,
		discover_radius: 30
	}];

	function formatDate(d){
		var months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
		return months[d.getMonth()] + ' ' + d.getDate() + ', ' + d.getFullYear();
	};

	return {
		remove: function(landmark){
			landmarks.splice(landmarks.indexOf(landmark), 1);
		},
		get: function(landmarkId){
			for(l of landmarks){
				if(l.id === parseInt(landmarkId))
					return l;
			}
			return null;
		},
		create: function(landmark){
			landmark.id = landmarks[landmarks.length-1].id + 1;
			landmark.creator = Users.get(landmark.creator_id);
			landmark.date_created = formatDate(new Date());
			landmark.date_expiration = null;
			landmark.status = 1;
			landmark.discover_radius = 0;

			landmarks.push(landmark);
			console.log('Landmark Created');
			console.log(landmark)
			return landmark;
		},
		get_by_user: function(userId){
			user_landmarks = [];
			for(l of landmarks){
				if(l.creator_id === parseInt(userId) && l.status != 0)
					user_landmarks.push(l);
			}
			return user_landmarks;
		},
		get_inactive: function(userId){
			user_landmarks = [];
			for(l of landmarks){
				if(l.creator_id === parseInt(userId) && l.status == 0)
					user_landmarks.push(l);
			}
			return user_landmarks;
		},
		get_persistent: function(){
			local_landmarks = [];
			for(l of landmarks){
				if(l.status == 2)
					local_landmarks.push(l);
			}
			return local_landmarks
		}
	}
})

.factory('Followers', function(Users){
	var followers = [{
		followerId: 2,
		follower: Users.get(2),
		followedId: 1,
		followed: Users.get(1)
	}, {
		followerId: 3,
		follower: Users.get(3),
		followedId: 1,
		followed: Users.get(1)
	}, {
		followerId: 4,
		follower: Users.get(4),
		followedId: 1,
		followed: Users.get(1)
	}, {
		followerId: 5,
		follower: Users.get(5),
		followedId: 1,
		followed: Users.get(1)
	}, {
		followerId: 2,
		follower: Users.get(2),
		followedId: 3,
		followed: Users.get(3)
	}, {
		followerId: 3,
		follower: Users.get(3),
		followedId: 2,
		followed: Users.get(3)
	}, {
		followerId: 3,
		follower: Users.get(3),
		followedId: 4,
		followed: Users.get(4)
	}, {
		followerId: 4,
		follower: Users.get(4),
		followedId: 3,
		followed: Users.get(3)
	}, {
		followerId: 2,
		follower: Users.get(2),
		followedId: 4,
		followed: Users.get(4)
	}, {
		followerId: 2,
		follower: Users.get(2),
		followedId: 5,
		followed: Users.get(5)
	}, {
		followerId: 5,
		follower: Users.get(5),
		followedId: 2,
		followed: Users.get(2)
	}, {
		followerId: 3,
		follower: Users.get(3),
		followedId: 5,
		followed: Users.get(5)
	}, {
		followerId: 5,
		follower: Users.get(5),
		followedId: 3,
		followed: Users.get(3)
	}];

	return {
		get_following: function(userId){
			var fl = [];
			for(f of followers){
				if(f.followerId === parseInt(userId)){
					fl.push(f.followed);
				}
			}
			return fl;
		},
		get_followers: function(userId){
			var fl = [];
			for(f of followers){
				if(f.followedId === parseInt(userId))
					fl.push(f.follower);
			}
			return fl;
		},
		unfollow: function(userId, followedId){
			console.log('Unfollowing User');
			console.log(Users.get(followedId));
			for(var i=0; i<followers.length; i++){
				if(userId == followers[i].followerId && followedId == followers[i].followedId){
					followers.splice(i, 1);
					break;
				}
			}
			console.log('Followers');
			console.log(followers);
		},
		follow: function(userId, followedId){
			console.log('Following User');
			console.log(Users.get(followedId));

			var f = {}
			f.followerId = userId;
			f.follower = Users.get(userId);
			f.followedId = followedId;
			f.followed = Users.get(followedId);

			followers.push(f);
			return f;
		},
		isFollowing: function(followerId, followedId){
			for(f of followers){
				if(f.followerId == followerId && f.followedId == followedId)
					return true;
			}
			return false;
		}
	};
})

//TODO: when user visits local, add the a challenge as completed
//TODO: in db only cascade delete for recipient when status = 0, 1
//TODO: add timestamp for completion
//TODO: Set up time check on getting challenges

.factory('Challenges', function(Users, Landmarks){
	var challenges = [{
		id: 1,
		landmark_id: 6,
		landmark: Landmarks.get(6),
		sender_id: 1,
		sender: Users.get(1),
		recipient_id: 2,
		recipient: Users.get(2),
		status: 1
	}, {
		id: 2,
		landmark_id: 6,
		landmark: Landmarks.get(6),
		sender_id: 1,
		sender: Users.get(1),
		recipient_id: 3,
		recipient: Users.get(3),
		status: 1
	}, {
		id: 3,
		landmark_id: 6,
		landmark: Landmarks.get(6),
		sender_id: 1,
		sender: Users.get(1),
		recipient_id: 4,
		recipient: Users.get(4),
		status: 1
	}, {
		id: 4,
		landmark_id: 6,
		landmark: Landmarks.get(6),
		sender_id: 1,
		sender: Users.get(1),
		recipient_id: 5,
		recipient: Users.get(5),
		status: 1
	}, {
		id: 5,
		landmark_id: 1,
		landmark: Landmarks.get(1),
		sender_id: 5,
		sender: Users.get(5),
		recipient_id: 2,
		recipient: Users.get(2),
		status: 1
	}, {
		id: 6,
		landmark_id: 1,
		landmark: Landmarks.get(1),
		sender_id: 5,
		sender: Users.get(5),
		recipient_id: 3,
		recipient: Users.get(3),
		status: 3
	}, {
		id: 7,
		landmark_id: 1,
		landmark: Landmarks.get(1),
		sender_id: 3,
		sender: Users.get(3),
		recipient_id: 4,
		recipient: Users.get(4),
		status: 1
	}, {
		id: 8,
		landmark_id: 2,
		landmark: Landmarks.get(2),
		sender_id: 3,
		sender: Users.get(3),
		recipient_id: 2,
		recipient: Users.get(2),
		status: 2
	}, {
		id: 9,
		landmark_id: 2,
		landmark: Landmarks.get(2),
		sender_id: 3,
		sender: Users.get(3),
		recipient_id: 4,
		recipient: Users.get(4),
		status: 1
	}, {
		id: 10,
		landmark_id: 2,
		landmark: Landmarks.get(2),
		sender_id: 3,
		sender: Users.get(3),
		recipient_id: 5,
		recipient: Users.get(5),
		status: 1
	}, {
		id: 11,
		landmark_id: 3,
		landmark: Landmarks.get(3),
		sender_id: 2,
		sender: Users.get(2),
		recipient_id: 3,
		recipient: Users.get(3),
		status: 1
	}, {
		id: 12,
		landmark_id: 3,
		landmark: Landmarks.get(3),
		sender_id: 2,
		sender: Users.get(2),
		recipient_id: 5,
		recipient: Users.get(5),
		status: 1
	}, {
		id: 13,
		landmark_id: 4,
		landmark: Landmarks.get(4),
		sender_id: 2,
		sender: Users.get(2),
		recipient_id: 3,
		recipient: Users.get(3),
		status: 3
	}, {
		id: 14,
		landmark_id: 4,
		landmark: Landmarks.get(4),
		sender_id: 2,
		sender: Users.get(2),
		recipient_id: 5,
		recipient: Users.get(5),
		status: 1
	}, {
		id: 15,
		landmark_id: 4,
		landmark: Landmarks.get(4),
		sender_id: 3,
		sender: Users.get(3),
		recipient_id: 4,
		recipient: Users.get(4),
		status: 1
	}, {
		id: 16,
		landmark_id: 5,
		landmark: Landmarks.get(5),
		sender_id: 4,
		sender: Users.get(4),
		recipient_id: 2,
		recipient: Users.get(2),
		status: 3
	}, {
		id: 17,
		landmark_id: 5,
		landmark: Landmarks.get(5),
		sender_id: 4,
		sender: Users.get(4),
		recipient_id: 3,
		recipient: Users.get(3),
		status: 1
	}, {
		id: 18,
		landmark_id: 5,
		landmark: Landmarks.get(5),
		sender_id: 2,
		sender: Users.get(2),
		recipient_id: 5,
		recipient: Users.get(5),
		status: 1
	}, {
		id: 19,
		landmark_id: 8,
		landmark: Landmarks.get(8),
		sender_id: 1,
		sender: Users.get(1),
		recipient_id: 3,
		recipient: Users.get(3),
		status: 2
	}];

	function createChallenge(senderId, recipientId, landmarkId){
		var c = {};
		c.id = challenges[challenges.length-1].id + 1;
		c.landmark_id = landmarkId;
		c.landmark = Landmarks.get(landmarkId);
		c.sender_id = senderId;
		c.sender = Users.get(senderId);
		c.recipient_id = recipientId;
		c.recipient = Users.get(recipientId);
		c.status = 1;
		challenges.push(c);
		console.log("Challenge Created");
		console.log(c);
	}

	return{
		create: function(senderId, recipientId, landmarkId){
			createChallenge(senderId, recipientId, landmarkId);
		},
		get: function(cId){
			for(c of challenges){
				if(cId == c.id)
					return c;
			}
		},
		hide: function(ch){
			for(c of challenges){
				if(c.id == ch.id){
					c.status = 0;
					break;
				}
			}
		},
		check_in: function(userId, landmark, status){
			var setVisited = false;
			for(c of challenges){
				if(c.recipient_id === parseInt(userId) && c.landmark_id == landmark.id && c.status === 1){
					// Find completed challenge, set status to 2 or 3
					if(!setVisited){
						setVisited = true;
						c.status = status;
					}
					// Set any other challenges for the same landmark to a status of 0
					else
						c.status = 0;
				}
			}
			
			
		},
		get_pending: function(userId){
			var pending = [];
			for(c of challenges){
				if(c.recipient_id === parseInt(userId) && c.status === 1)
					pending.push(c);
			}
			return pending
		},
		get_completed: function(userId){
			var completed = [];
			for(c of challenges){
				if(c.recipient_id === parseInt(userId) && c.status > 1)
					completed.push(c);
			}
			return completed
		},
		get_visitors: function(landmarkId){
			var visitors = [];
			for(c of challenges){
				if(c.landmark_id == parseInt(landmarkId) && c.status > 1)
					visitors.push(c.recipient);
			}
			return visitors;
		},
		get_visited: function(userId){
			var visited = [];
			for(c of challenges){
				if(c.status > 1 && c.recipient_id == parseInt(userId))
					visited.push(c);
			}
			return visited;
		},
		get_persistent: function(userId){			
			local_landmarks = Landmarks.get_persistent();
			for(c of challenges){
				if(local_landmarks.length == 0)
						break;
				for(l of local_landmarks){
					if(c.status > 1 && c.landmark_id == l.id && c.recipient_id == userId){
						local_landmarks.splice(local_landmarks.indexOf(l), 1);
						break;
					}
				}
			}
			return local_landmarks;
		},
		unfollow_challenges: function(userId, followedId){
			rem_indexes = [];
			for(var i=0; i<challenges.length; i++){
				if(challenges[i].recipient_id == userId && challenges[i].sender_id == followedId)
					rem_indexes.push(i);
			}
			for(var i=rem_indexes.length-1; i>=0; i--)
				challenges.splice(rem_indexes[i], 1);
		},
		follow_challenges: function(userId, followedId){
			var newLandmarks = Landmarks.get_by_user(followedId);
			for(l of newLandmarks)
				createChallenge(followedId, userId, l.id);
		}
	}
})









.service('AuthService', function($q, $http, RESOURCES){
	var LOCAL_TOKEN_KEY = 'landmarked_token';
	var username = '';
	var isAuthenticated = false;
	var authToken;

	function loadUserCredentials(){
		var token = window.localStorage.getItem(LOCAL_TOKEN_KEY);
		if(token)
			useCredentials(token);
	}

	function storeUserCredentials(token){
		window.localStorage.setItem(LOCAL_TOKEN_KEY, token);
		useCredentials(token);
	}

	function useCredentials(token){
		//username = token.split('.')[0];
		isAuthenticated = true;
		authToken = token;

    	// Set the token as header for your requests!
    	$http.defaults.headers.common.Authorization = authToken;
	}

	function destroyUserCredentials(){
		authToken = undefined;
		username = '';
		isAuthenticated = false;
		$http.defaults.headers.common.Authorization = undefined;
    	window.localStorage.removeItem(LOCAL_TOKEN_KEY);
	}

	var register = function(user){
		return $q(function(resolve, reject){
			$http.post(RESOURCES.apiURL + '/users', user, {
				headers: {'Content-Type': 'application/x-www-form-urlencoded'}
			})
			.then(function(result){
				if (result.data.success) 
					resolve(result.data.msg);
				else
					reject(result.data.msg);
			});
		});
	};

	var login = function(user){
		return $q(function(resolve, reject){
			$http.defaults.headers.common['Authorization'] = 'Basic ' + user.username + ':' + user.password;
			$http.post(RESOURCES.apiURL + '/token', user).then(function(result){
				if(result.data.success){
					storeUserCredentials(result.data.token);
					resolve(result.data.msg);
				} 
				else
					reject(result.data.msg);
			});
		});
	}

	var logout = function(){
		destroyUserCredentials();
	}

	loadUserCredentials();

	return{
		login: login,
		register: register,
		logout: logout,
		isAuthenticated: function() { return isAuthenticated; }
	};

})

.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
  return {
    responseError: function (response) {
      $rootScope.$broadcast({
        401: AUTH_EVENTS.notAuthenticated
      }[response.status], response);
      return $q.reject(response);
    }
  };
})

.config(function ($httpProvider) {
  $httpProvider.interceptors.push('AuthInterceptor');
});