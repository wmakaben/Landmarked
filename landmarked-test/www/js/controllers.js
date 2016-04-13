angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $state, $ionicPopup){
	$scope.username = 'test';
})

.controller('LoginCtrl', function($scope, $state, $ionicPopup){
	$scope.test = 'test - login';
})

.controller('RegisterCtrl', function($scope, $state, $ionicPopup){
	$scope.test = 'test - register';
})

.controller('LandmarksCtrl', function($scope){
	$scope.test = 'test - landmarks';
})

.controller('MeCtrl', function($scope){
	$scope.test = 'test - me';
})

.controller('FriendsCtrl', function($scope){
	$scope.test = 'test - friends';
})