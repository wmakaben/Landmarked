angular.module('starter.services', ['starter.constants'])

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