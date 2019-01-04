// creates the app module
// the params are (name, dependencies)
var myApp = angular.module('rustNStardustSite', ['ngRoute']);

// function called during program load
myApp.config(['$routeProvider', function($routeProvider) {
   $routeProvider.

   when('/home', {
      templateUrl: 'home.htm', controller: 'HomeController'
   }).

   when('/music', {
      templateUrl: 'music.htm', controller: 'MusicController'
   }).

   when('/shows', {
      templateUrl: 'shows.htm', controller: 'ShowsController'
   }).

   when('/merch', {
      templateUrl: 'merch.htm', controller: 'MerchController'
   }).

   when('/contact', {
      templateUrl: 'contact.htm', controller: 'ContactController'
   }).

   when('/about', {
      templateUrl: 'about.htm', controller: 'AboutController'
   }).

   otherwise({
      redirectTo: '/home'
   });

}]);

// function called during main execution
//myApp.run(function(){


//});

myApp.controller('HomeController', ['$scope', function($scope){
  // do nothing
}]);

myApp.controller('MusicController', ['$scope', function($scope){
  // do nothing
}]);

myApp.controller('ShowsController', ['$scope', function($scope){
  $scope.showsList = [
    {
      date: "October 23, 2018",
      location: "Brighton Bar",
      time: "7:00 pm",
      price: "$10",
      upcoming: 1
    }

  ];
}]);

myApp.controller('MerchController', ['$scope', function($scope){
$scope.message = "merch merch merch";
}]);



myApp.controller('ContactController', ['$scope', function($scope){
$scope.message = "contact contact contact";
}]);

myApp.controller('AboutController', ['$scope', function($scope){
$scope.message = "My name is Trevor!";
}]);
