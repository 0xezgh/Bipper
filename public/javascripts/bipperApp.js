/**
 * Created by mohamedezzedine on 08/12/2016.
 */
var app = angular.module('bipperApp', ['ngRoute', 'ngResource']).run(function($rootScope,$http) {
    $rootScope.authenticated = false;
    $rootScope.current_user = '';

    //signout function
    $rootScope.signout = function(){
        $http.get('auth/signout');
        $rootScope.authenticated = false;
        $rootScope.current_user = '';

    };

});

app.config(function($routeProvider){
    $routeProvider
    //the timeline display
        .when('/', {
            templateUrl: 'main.html',
            controller: 'mainController'
        })
        //the login display
        .when('/login', {
            templateUrl: 'login.html',
            controller: 'authController'
        })
        //the signup display
        .when('/register', {
            templateUrl: 'register.html',
            controller: 'authController'
        });
});

app.factory('beepService', function($resource){
    return $resource('/api/beeps/:id');
});

app.controller('mainController', function(beepService, $scope, $rootScope){
    $scope.beeps = beepService.query();
    $scope.newBeep = {created_by: '', text: '', created_at: ''};

    //posting function
    $scope.beepIt = function() {
        $scope.newBeep.created_by = $rootScope.current_user;
        $scope.newBeep.created_at = Date.now();
        beepService.save($scope.newBeep, function(){
                    $scope.beeps = beepService.query();
                    $scope.newBeep = {created_by: '', text: '', created_at: ''};
        });
    };
});

app.controller('authController', function($scope, $http, $rootScope, $location){
    $scope.user = {username: '', password: ''};
    $scope.error_message = '';

    //login function
    $scope.login = function(){
        $http.post('/auth/login', $scope.user).success(function(data){
            if(data.state == 'success'){
                $rootScope.authenticated = true;
                $rootScope.current_user = data.user.username;
                $location.path('/');
            }
            else{
                $scope.error_message = data.message;
            }
        });
    };

    //register function
    $scope.register = function(){
        $http.post('/auth/signup', $scope.user).success(function(data){
            if(data.state == 'success'){
                $rootScope.authenticated = true;
                $rootScope.current_user = data.user.username;
                $location.path('/');
            }
            else{
                console.log(data.message);
                $scope.error_message = data.message;
            }
        });
    };
});
