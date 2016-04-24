// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'starter.services', 'starter.constants'])

.run(function($ionicPlatform) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {
  $ionicConfigProvider.tabs.position('bottom');
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  .state('login', {
    url: '/login',
    templateUrl: 'templates/login.html',
    controller: 'LoginCtrl'
  })

  .state('register', {
    url: '/register',
    templateUrl: 'templates/register.html',
    controller: 'RegisterCtrl'
  })

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/tab',
    abstract: true,
    templateUrl: 'templates/tabs.html'
  })

  // Each tab has its own nav history stack:

  .state('tab.me', {
    url: '/me',
    views: {
      'tab-me': {
        templateUrl: 'templates/tab-me.html',
        controller: 'MeCtrl'
      }
    }
  })
    .state('tab.me-active-details', {
      url:'/me/active/:landmarkId',
      views: {
        'tab-me': {
          templateUrl: 'templates/landmark-details.html',
          controller: 'MyLandmarkDetailCtrl'
        }
      }
    })
    .state('tab.me-created', {
      url: '/me/created',
      views: {
        'tab-me': {
          templateUrl: 'templates/me-created.html',
          controller: 'MeCreatedCtrl'
        }
      }
    })
      .state('tab.me-created-details', {
        url:'/me/created/:landmarkId',
        views:{
          'tab-me': {
            templateUrl: 'templates/landmark-details.html',
            controller: 'MyLandmarkDetailCtrl'
          }
        }
      })
    .state('tab.me-visited', {
      url: '/me/visited',
      views: {
        'tab-me': {
          templateUrl: 'templates/me-visited.html',
          controller: 'MeVisitedCtrl'
        }
      }
    })
      .state('tab.me-visited-details', {
        url:'/me/visited/:landmarkId',
        views:{
          'tab-me': {
            templateUrl: 'templates/landmark-details.html',
            controller: 'MyLandmarkDetailCtrl'
          }
        }
      })

  .state('tab.landmarks', {
    url: '/landmarks',
    views: {
      'tab-landmarks': {
        templateUrl: 'templates/tab-landmarks.html',
        controller: 'LandmarksCtrl'
      }
    }
  })
    .state('tab.landmarks-detail', {
      url: '/landmarks/:landmarkId',
      views: {
        'tab-landmarks': {
          templateUrl: 'templates/landmark-details.html',
          controller: 'LandmarkDetailCtrl'
        }
      }
    })

  .state('tab.friends', {
    url: '/friends',
    views: {
      'tab-friends': {
        templateUrl: 'templates/tab-friends.html',
        controller: 'FriendsCtrl'
      }
    }
  });

  // if none of the above states are matched, use this as the fallback
  //$urlRouterProvider.otherwise('/tab/landmarks');
  $urlRouterProvider.otherwise('/login');
});
