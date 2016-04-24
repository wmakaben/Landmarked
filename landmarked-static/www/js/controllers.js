angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope){
  $scope.username = ''
  // Set up auth services
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
  $scope.landmark.creator_info = Users.get($scope.landmark.creator);
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
  //console.log($scope.landmark);
})

.controller('LandmarksCtrl', function($scope, GeoService, Challenges, $ionicLoading, $timeout, TMP_USER) {
  // TODO: get local landmarks

  $scope.pending_challenges = Challenges.get_pending(TMP_USER);

  function getChallenges(){
    $scope.pending_challenges = Challenges.get_pending(TMP_USER);
    $scope.pending_challenges = GeoService.get_distances($scope.pending_challenges, function(){});
  }

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
    var callback = function(){
      $ionicLoading.hide();
    }
    // gets challenges
    $scope.pending_challenges = Challenges.get_pending(TMP_USER);
    $scope.pending_challenges = GeoService.get_distances($scope.pending_challenges, callback, start);
  }

  // Initialize the view
  $scope.init();

  // Refresh
  $scope.doRefresh = function(){
    getChallenges();
    //$scope.init();
    $scope.$broadcast('scroll.refreshComplete');
  }
})

.controller('MeCtrl', function($scope, Users, Landmarks, Challenges, TMP_USER) {
  // User info
  $scope.user = Users.get(TMP_USER);
  // User active landmarks
  $scope.user.landmarks = Landmarks.get_by_user(TMP_USER);
  // User landmarks visited count
  $scope.user.visited = Challenges.get_completed(TMP_USER).length;
  // User landmarks created count
  $scope.user.created = $scope.user.landmarks.length;
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

.controller('FriendsCtrl', function($scope, Followers, Users, TMP_USER) {
  $scope.following = Followers.get_following(TMP_USER);
  $scope.followers = Followers.get_followers(TMP_USER);

  //$scope.remove = function(friend){
  //  Friends.remove(friend);
  //};
});