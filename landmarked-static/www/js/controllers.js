angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $ionicLoading, Landmarks, Followers, Challenges, TMP_USER){
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
    }, function(){
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
    $scope.new_landmark.creator_id = TMP_USER;
    // Create landmark
    $scope.new_landmark = Landmarks.create($scope.new_landmark);
    // Get Friends
    var followers = Followers.get_followers(TMP_USER);
    // Send challenges
    for(f of followers)
      Challenges.create(TMP_USER, f.id, $scope.new_landmark.id);

    $scope.new_landmark = {};
    $scope.closeModal();
  }
})

.controller('LoginCtrl', function($scope, $state, $ionicPopup){
  $scope.data = {
    username: '',
    password: ''
  };

  
  $scope.validate = function(){
    $state.go('tab.landmarks');
  }

  $scope.login = function(){
    /*var alertPopup = $ionicPopup.alert({
      title: 'Login attempt',
      template: 'Username: ' + data.username + ', Password: ' + data.password
    });*/
    
    $state.go('tab.landmarks');
    
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

.controller('LandmarkDetailCtrl', function($scope, $stateParams, $ionicLoading, Landmarks, Challenges, Users, GeoService, TMP_USER){
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
  }
})

.controller('LandmarksCtrl', function($scope, $ionicLoading, $timeout, GeoService, Challenges, Landmarks, TMP_USER) {
  $scope.challenges = {};
  $scope.challenges.pending = Challenges.get_pending(TMP_USER);
  
  // Returns a list of challenges with the distance from the user
  function getChallenges(cb, s){
    $scope.challenges = {};
    // Pending challenges
    $scope.challenges.pending = Challenges.get_pending(TMP_USER);
    // Local Challenges
    $scope.challenges.local = Challenges.get_persistent(TMP_USER);
    // Adds distance fields to all challenges
    $scope.challenges = GeoService.get_distances($scope.challenges, cb, s);
  }

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

  $scope.createLandmark = function(){
    $scope.openModal();
  };
})

.controller('MeCtrl', function($scope, Users, Landmarks, Challenges, TMP_USER) {
  function getUser(){
    // User info
    $scope.user = Users.get(TMP_USER);
    $scope.user.myProfile = true;
    // User active landmarks
    $scope.user.landmarks = Landmarks.get_by_user(TMP_USER);
    // User landmarks visited count
    $scope.user.visited = Challenges.get_completed(TMP_USER).length;
    // User landmarks created count
    $scope.user.created = $scope.user.landmarks.length;
  }

  getUser();

  // Refresh User Info
  $scope.doRefresh = function(){
    getUser();
    $scope.$broadcast('scroll.refreshComplete');
  };
})

.controller('MeCreatedCtrl', function($scope, Landmarks, TMP_USER) {
  // Inactive Landmarks
  $scope.inactive_landmarks = Landmarks.get_inactive(TMP_USER);
  $scope.inactive_count = $scope.inactive_landmarks.length;
  // Active Landmarks
  $scope.active_landmarks = Landmarks.get_by_user(TMP_USER);
  $scope.active_count = $scope.active_landmarks.length;
})

.controller('MeVisitedCtrl', function($scope, Challenges, TMP_USER){
  $scope.visited_landmarks = Challenges.get_visited(TMP_USER);
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

.controller('FriendsCtrl', function($scope, Followers, Users, Challenges, TMP_USER) {
  function getFriends(){
    $scope.following = Followers.get_following(TMP_USER);
    $scope.followers = Followers.get_followers(TMP_USER);
  }

  getFriends();

  // Refresh landmarks
  $scope.doRefresh = function(){
    getFriends();
    $scope.$broadcast('scroll.refreshComplete');
  };

  $scope.remove = function(user){
    Followers.unfollow(TMP_USER, user.id);
    Challenges.unfollow_challenges(TMP_USER, user.id);
    getFriends();
  };
})

.controller('FriendProfileCtrl', function($scope, $stateParams, Landmarks, Challenges, Followers, Users, TMP_USER){
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