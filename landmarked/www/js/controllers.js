angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope){
  $scope.username = ''
  // Set up auth services
})

.controller('LoginCtrl', function($scope, $state, $ionicPopup, AuthService){
  $scope.data = {
    username: '',
    password: ''
  };

  $scope.login = function(data){
    
    AuthService.login($scope.data)
    .then(function(){
      $state.go('tab.landmarks');
    }, function(errMsg){
      var alertPopup = $ionicPopu.alert({
        title: 'Login failed!',
        template: errMsg
      });
    });
    /*
    var alertPopup = $ionicPopup.alert({
      title: 'Login attempt',
      template: 'Username: ' + data.username + ', Password: ' + data.password
    });*/

    //$state.go('tab.landmarks');

  };
})

.controller('RegisterCtrl', function($scope, $state, $ionicPopup, AuthService){
  $scope.data = {
    firstname: '',
    lastname: '',
    username: '',
    password: '',
    confirm: ''
  };

  $scope.register = function(){
    var test = {
      'first_name': 'please',
      'last_name': 'work',
      'username': 'ineedthis',
      'password': 'test',
      'phone': '1111111111'
    }
    t = new FormData(test);

    AuthService.register(t)
    .then(function(msg){
      $state.go('outside.login');
      var alertPopup = $ionicPopup.alert({
        title: 'Register Success!',
        template: msg
      });
    }, function(errMsg){
      var alertPopup = $ionicPopup.alert({
        title: 'Register failed!',
        template: errMsg
      });
    });
  };
})

.controller('LandmarksCtrl', function($scope) {

})

.controller('MeCtrl', function($scope) {

})

.controller('FriendsCtrl', function($scope) {

});