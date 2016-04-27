angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $ionicLoading, Landmarks, Followers, Challenges, UserAccount){
  $scope.new_landmark = {};
  $scope.new_landmark.location_name = '';
  $scope.new_landmark.description = '';
  // Set up auth services

  $ionicModal.fromTemplateUrl('my-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {
    // starts the loading screen
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

    // options for geolocation service
    var options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };
    
    navigator.geolocation.getCurrentPosition(function(pos){
      $ionicLoading.hide();
      $scope.new_landmark.latitude = pos.coords.latitude;
      $scope.new_landmark.longitude = pos.coords.longitude;
      $scope.modal.show();
    }, function(err){
      console.warn('Error(' + err.code + '): ' + err.message);
      $ionicLoading.hide();
      var alertPopup = $ionicPopup.alert({
        title: 'Unable to retrieve location',
        template: 'Try again at a later time'
      });
      alertPopup.then(function(res) {});
    }, options);
    
  };
  $scope.closeModal = function() { $scope.modal.hide(); };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() { $scope.modal.remove(); });
  // Execute action on hide modal
  $scope.$on('modal.hidden', function() {});
  // Execute action on remove modal
  $scope.$on('modal.removed', function() {});

  $scope.createLandmark = function(landmark){
    $scope.new_landmark.creator_id = UserAccount.get().id;
    // Create landmark
    $scope.new_landmark = Landmarks.create($scope.new_landmark);
    // Get Friends
    var followers = Followers.get_followers(UserAccount.get().id);
    // Send challenges
    for(f of followers)
      Challenges.create(UserAccount.get().id, f.id, $scope.new_landmark.id);

    $scope.new_landmark = {};
    $scope.closeModal();
  }
})

.controller('LoginCtrl', function($scope, $state, $ionicPopup, UserAccount){
  $scope.user = {
    username: '',
    password: ''
  };

  
  $scope.validate = function(){
    $state.go('tab.landmarks');
  }

  $scope.login = function(){
    var userAccount = UserAccount.login($scope.user.username);
    if(userAccount != null)
      $state.go('tab.landmarks');
    else{
      var alertPopup = $ionicPopup.alert({
        title: 'Incorrect Login Credentials',
        template: 'Please try again'
      });
    }
  };
})

.controller('RegisterCtrl', function($scope, $state, $ionicPopup){
  $scope.data = {
    first_name: '',
    last_name: '',
    username: '',
    password: '',
    confirm: ''
  };

  $scope.register = function(){
    /*
    var alertPopup = $ionicPopup.alert({
      title: 'Login attempt',
      template: 'Username: ' + $scope.data.username + ', Password: ' + $scope.data.password
    });
    */
    $state.go('tab.friends');
  };
})

.controller('LandmarkDetailCtrl', function($scope, $stateParams, $ionicLoading, $ionicPopup, Landmarks, Challenges, Users, GeoService, UserAccount){
  $scope.landmark = Landmarks.get($stateParams.landmarkId);
  $scope.landmark.visitor_count = Challenges.get_visitors($stateParams.landmarkId).length;
  $scope.landmark.isChallenge = true;
  // starts the loading screen
  var start = function(){
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
  };
  // Callback function to hide loading screen
  var callback = function(){ $ionicLoading.hide(); }
  $scope.landmark = GeoService.get_distance($scope.landmark, callback, start);

  $scope.doRefresh = function(){
    $scope.landmark = GeoService.get_distance($scope.landmark, callback, start);
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.checkIn = function(){
    var confirmPopup = $ionicPopup.confirm({
      title: 'Landmark Visited',
      template: 'Would you like to share this your followers?'
    })

    confirmPopup.then(function(res){
      if(res){
        console.log('Challenge Shared');
        Challenges.check_in(UserAccount.get().id, $scope.landmark, 3);
        $scope.landmark.isChallenge = false;
      } else{
        console.log('Challenge Not Shared');
        Challenges.check_in(UserAccount.get().id, $scope.landmark, 2);
        $scope.landmark.isChallenge = false;
      }
    })
  };
})

.controller('LandmarksCtrl', function($scope, $ionicLoading, $timeout, $state, GeoService, Challenges, Landmarks, UserAccount) {
  $scope.challenges = {};
  $scope.challenges.pending = Challenges.get_pending(UserAccount.get().id);
  
  // Returns a list of challenges with the distance from the user
  function getChallenges(cb, s){
    // options for geolocation service
    var options = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0
    };
    // Geolocation error
    var error = function(err){
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

    var getChallengeDistances = function(pos){
      var lat1 = pos.coords.latitude;
      var lon1 = pos.coords.longitude;

      console.log('Current Position');
      console.log('Latitude: ' + lat1);
      console.log('Longitude: ' + lon1);
      // Get distance for pending challenges
      for(c of $scope.challenges.pending){
        var lat2 = c.landmark.latitude;
        var lon2 = c.landmark.longitude;
        var d = parseFloat(getDistance(lat1, lon1, lat2, lon2).toFixed(2));
        if(d > 10)
          d = parseInt(d);
        c.distance = d;
      }

      // Get distance for local landmarks
      for(c of $scope.challenges.local){       
        var d = parseFloat(getDistance(lat1, lon1, c.latitude, c.longitude).toFixed(2));
        if(d > 10)
          d = parseInt(d);
        c.distance = d;
      }

      /*
      // Set up map
      var latLng = new google.maps.LatLng(lat1, lon1);
      var mapOptions = {
        center: latLng,
        zoom:15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      $scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
      */
      if(cb)
        cb();
    }

    $scope.challenges = {};
    // Pending challenges
    $scope.challenges.pending = Challenges.get_pending(UserAccount.get().id);
    // Local Challenges
    $scope.challenges.local = Challenges.get_persistent(UserAccount.get().id);
    
    if(s)
      s();
    navigator.geolocation.getCurrentPosition(getChallengeDistances, error, options);
  }

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

  // Initialize view with landmarks
  $scope.init = function(){
    // starts the loading screen
    var start = function(){
      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });
    };

    // Callback function to hide loading screen
    var callback = function(){ $ionicLoading.hide(); }

    // Get challenges
    getChallenges(callback, start);
  };
  
  $scope.init();

  // Refresh landmarks
  $scope.doRefresh = function(){
    getChallenges();
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.hide = function(challenge){
    Challenges.hide(challenge);
    $scope.challenges.pending.splice($scope.challenges.pending.indexOf(challenge), 1);
  };

  $scope.createLandmark = function(){ $scope.openModal(); };

  $scope.openMaps = function() { 
    
  }
})


.controller('MeCtrl', function($scope, $state, $ionicPopup, Users, Landmarks, Challenges, UserAccount) {
  function getUser(){
    // User info
    $scope.user = Users.get(UserAccount.get().id);
    $scope.user.myProfile = true;
    // User active landmarks
    $scope.user.landmarks = Landmarks.get_by_user(UserAccount.get().id);
    // User landmarks visited count
    $scope.user.visited = Challenges.get_completed(UserAccount.get().id).length;
    // User landmarks created count
    $scope.user.created = $scope.user.landmarks.length;
  }

  getUser();

  // Refresh User Info
  $scope.doRefresh = function(){
    getUser();
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.createLandmark = function(){ $scope.openModal(); };

  $scope.logout = function(){
    var confirmLogout = $ionicPopup.confirm({
      title: 'Logout',
      template: 'Would you like to sign out of this account?'
    })

    confirmLogout.then(function(res){
      if(res){
        $state.go('login');
      }
    });
  };
})

.controller('MeCreatedCtrl', function($scope, Landmarks, UserAccount) {
  // Inactive Landmarks
  $scope.inactive_landmarks = Landmarks.get_inactive(UserAccount.get().id);
  $scope.inactive_count = $scope.inactive_landmarks.length;
  // Active Landmarks
  $scope.active_landmarks = Landmarks.get_by_user(UserAccount.get().id);
  $scope.active_count = $scope.active_landmarks.length;
})

.controller('MeVisitedCtrl', function($scope, Challenges, UserAccount){
  $scope.visited_landmarks = Challenges.get_visited(UserAccount.get().id);
  console.log($scope.visited_landmarks);
})

.controller('MyLandmarkDetailCtrl', function($scope, $stateParams, Landmarks, Challenges, Users){
  $scope.landmark = Landmarks.get($stateParams.landmarkId);
  $scope.landmark.visitor_count = Challenges.get_visitors($stateParams.landmarkId).length;
  $scope.landmark.myLandmark = true;
})

.controller('LandmarkVisitorsCtrl', function($scope, $stateParams, Challenges){
  $scope.visitors = Challenges.get_visitors($stateParams.landmarkId); 
})

.controller('FriendsCtrl', function($scope, $ionicModal, Followers, Users, Challenges, UserAccount) {
  function getFriends(){
    $scope.following = Followers.get_following(UserAccount.get().id);
    $scope.followers = Followers.get_followers(UserAccount.get().id);
  }

  getFriends();

  // Refresh landmarks
  $scope.doRefresh = function(){
    getFriends();
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.remove = function(user){
    Followers.unfollow(UserAccount.get().id, user.id);
    Challenges.unfollow_challenges(UserAccount.get().id, user.id);
    getFriends();
  };

  $scope.createLandmark = function(){ $scope.openModal(); };


  $scope.search = [];

  $scope.getSearch = function(username){
    if(username == '' || username.length < 2)
      $scope.search = [];
    else{
      $scope.search = Users.search(username, UserAccount.get().id);
      for(u of $scope.search)
        u.isFollowing = Followers.isFollowing(UserAccount.get().id, u.id);
    }
  }

  $ionicModal.fromTemplateUrl('friends-modal.html', {
    scope: $scope,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.fModal = modal;
  });
  $scope.openFModal = function() { 
    $scope.search_username = '';
    $scope.fModal.show(); 
  };
  $scope.closeFModal = function() { $scope.fModal.hide(); };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() { $scope.fModal.remove(); });
  // Execute action on hide modal
  $scope.$on('fModal.hidden', function() {});
  // Execute action on remove modal
  $scope.$on('fModal.removed', function() {});

  $scope.followUser = function(userId){
    Followers.follow(UserAccount.get().id, userId);
    Challenges.follow_challenges(UserAccount.get().id, userId);
    for(u of $scope.search)
        u.isFollowing = Followers.isFollowing(UserAccount.get().id, u.id);
  }
})

.controller('FriendProfileCtrl', function($scope, $stateParams, Landmarks, Challenges, Followers, Users, UserAccount){
  $scope.user = Users.get($stateParams.userId);
  $scope.user.isFriend = true;
  // User active landmarks
  $scope.user.landmarks = Landmarks.get_by_user($stateParams.userId);
  // User landmarks visited count
  $scope.user.visited = Challenges.get_completed($stateParams.userId).length;
  // User landmarks created count
  $scope.user.created = $scope.user.landmarks.length;
})

.controller('FriendLandmarkDetailCtrl', function($scope, $stateParams, Landmarks, Challenges){
  $scope.landmark = Landmarks.get($stateParams.landmarkId);
  $scope.landmark.visitor_count = Challenges.get_visitors($stateParams.landmarkId).length;
});