angular.module('starter.services', ['starter.constants'])

.factory('GeoService', function($ionicLoading){
	console.log('GeoAlert service instantiated');
	// Callback function after retrieving location
	var callback;
	// TODO: set min distance to landmark discover radius
	var minDistance = 10;

	var challenges, landmark;

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
    };

    // Geolocation success (add distances to challenges)
    function getChallengeDistances(pos){
    	var lat1 = pos.coords.latitude;
    	var lon1 = pos.coords.longitude;

    	console.log('Current Position');
    	console.log('Latitude: ' + lat1);
    	console.log('Longitude: ' + lon1);

    	for(c of challenges){
    		var lat2 = c.landmark.latitude;
    		var lon2 = c.landmark.longitude;

    		var d = parseFloat(getDistance(lat1, lon1, lat2, lon2).toFixed(2));
    		if(d > 10)
    			d = parseInt(d);

    		c.distance = d;
    	}
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
		username: 'cwalke03'
	}, {
		id: 4,
		first_name: 'Jon',
		last_name: 'Mize',
		username: 'jmize1'
	}, {
		id: 5,
		first_name: 'Scott',
		last_name: 'Michener',
		username: 'smichener'
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
		// Returns a list of usernames containing a given search phrase
		search: function(username){
			var search = []
			for(u of users){
				if(u.username.indexOf(username) > -1)
					search.push(user[i]);
			}
			return search
		}
	}
})

.factory('Landmarks', function(){
	var landmarks = [{
		id: 1,
		location_name: 'Villanova University',
		latitude: 40.037222,
		longitude: -75.349167,
		description: 'Check out an on campus event',
		creator: 5,
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
		creator: 3,
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
		creator: 2,
		date_created: formatDate(new Date()),
		date_expiration: null,
		status: 1,
		discover_radius: 0
	}, {
		id: 4,
		location_name: 'House',
		latitude: 40.0244978,
		longitude: -75.2119462,
		description: 'Try some beer',
		creator: 2,
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
		creator: 4,
		date_created: formatDate(new Date()),
		date_expiration: formatDate(new Date()),
		status: 1,
		discover_radius: 0
	}, {
		id: 6,
		location_name: 'Villanova, Mendel 296',
		latitude: 40.037222,
		longitude: -75.349167,
		description: 'Check out the demo for Landmarked',
		creator: 1,
		date_created: formatDate(new Date()),
		date_expiration: null,
		status: 1,
		discover_radius: 0
	}, {
		id: 7,
		location_name: 'Local Landmark',
		latitude: 40.0244978,
		longitude: -75.2119462,
		description: 'Local Landmark Test',
		creator: 1,
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
			for(var i=0; i<landmarks.length; i++){
				if(landmarks[i].id === parseInt(landmarkId))
					return landmarks[i];
			}
			return null;
		},
		get_by_user: function(userId){
			user_landmarks = [];
			for(var i=0; i<landmarks.length; i++){
				if(landmarks[i].creator === parseInt(userId) && landmarks[i].status != 0)
					user_landmarks.push(landmarks[i]);
			}
			return user_landmarks;
		},
		get_inactive: function(userId){
			user_landmarks = [];
			for(var i=0; i<landmarks.length; i++){
				if(landmarks[i].creator === parseInt(userId) && landmarks[i].status == 0)
					user_landmarks.push(landmarks[i]);
			}
			return user_landmarks;
		},
		get_persistent: function(){
			local_landmarks = [];
			for(var i=0; i<landmarks.length; i++){
				if(landmarks[i].status == 2)
					local_landmarks.push(landmarks[i]);
			}
			return local_landmarks;
		}
	}
})

.factory('Followers', function(Users){
	var followers = [{
		followerId: 2,
		followedId: 1
	}, {
		followerId: 3,
		followedId: 1
	}, {
		followerId: 4,
		followedId: 1
	}, {
		followerId: 5,
		followedId: 1
	}, {
		followerId: 2,
		followedId: 3
	}, {
		followerId: 3,
		followedId: 2
	}, {
		followerId: 3,
		followedId: 4
	}, {
		followerId: 4,
		followedId: 3
	}, {
		followerId: 2,
		followedId: 4
	}, {
		followerId: 2,
		followedId: 5
	}, {
		followerId: 5,
		followedId: 2
	}, {
		followerId: 3,
		followedId: 5
	}, {
		followerId: 5,
		followedId: 3
	}];

	return {
		get_following: function(userId){
			var f = [];
			for(var i=0; i<followers.length; i++){
				if(followers[i].followerId === parseInt(userId)){
					f.push(Users.get(followers[i].followedId));
				}
			}
			return f;
		},
		get_followers: function(userId){
			var f = [];
			for(var i=0; i<followers.length; i++){
				if(followers[i].followedId === parseInt(userId))
					f.push(Users.get(followers[i].followerId));
			}
			return f;
		}
		// TODO: remove
		// TODO: follow
	};
})

//TODO: when user visits local, add the a challenge as completed
//TODO: in db only cascade delete for recipient when status = 0, 1

.factory('Challenges', function(Users, Landmarks){
	var challenges = [{
		landmark_id: 6,
		sender: 1,
		recipient: 2,
		status: 1
	}, {
		landmark_id: 6,
		sender: 1,
		recipient: 3,
		status: 1
	}, {
		landmark_id: 6,
		sender: 1,
		recipient: 4,
		status: 1
	}, {
		landmark_id: 6,
		sender: 1,
		recipient: 5,
		status: 1
	}, {
		landmark_id: 1,
		sender: 5,
		recipient: 2,
		status: 1
	}, {
		landmark_id: 1,
		sender: 5,
		recipient: 3,
		status: 3
	}, {
		landmark_id: 1,
		sender: 3,
		recipient: 4,
		status: 1
	}, {
		landmark_id: 2,
		sender: 3,
		recipient: 2,
		status: 2
	}, {
		landmark_id: 2,
		sender: 3,
		recipient: 4,
		status: 1
	}, {
		landmark_id: 2,
		sender: 3,
		recipient: 5,
		status: 1
	}, {
		landmark_id: 3,
		sender: 2,
		recipient: 3,
		status: 1
	}, {
		landmark_id: 3,
		sender: 2,
		recipient: 5,
		status: 1
	}, {
		landmark_id: 4,
		sender: 2,
		recipient: 3,
		status: 3
	}, {
		landmark_id: 4,
		sender: 2,
		recipient: 5,
		status: 1
	}, {
		landmark_id: 4,
		sender: 3,
		recipient: 4,
		status: 1
	}, {
		landmark_id: 5,
		sender: 4,
		recipient: 2,
		status: 3
	}, {
		landmark_id: 5,
		sender: 4,
		recipient: 3,
		status: 1
	}, {
		landmark_id: 5,
		sender: 2,
		recipient: 5,
		status: 1
	}];

	return{
		get_pending: function(userId){
			var pending = [];
			for(c of challenges){
				if(c.recipient === parseInt(userId) && c.status === 1){
					var challenge = c;
					challenge.landmark = Landmarks.get(c.landmark_id);
					challenge.sender_details = Users.get(c.sender);
					pending.push(challenge);
				}
			}
			return pending
		},
		get_completed: function(userId){
			var completed = [];
			for(c of challenges){
				if(c.recipient === parseInt(userId) && c.status > 1)
					completed.push(c);
			}
			return completed
		},
		get_visitors: function(landmarkId){
			var visitors = [];
			for(c of challenges){
				if(c.landmark_id == parseInt(landmarkId) && c.status > 1)
					visitors.push(Users.get(c.recipient));
			}
			return visitors;
		},
		get_visited: function(userId){
			var visited = [];
			for(c of challenges){
				if(c.status > 1 && c.recipient == parseInt(userId)){
					var v = c;
					v.landmark = Landmarks.get(c.landmark_id);
					v.creator = Users.get(v.landmark.creator);
					console.log(v);
					visited.push(v);
				}
			}
			return visited;
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