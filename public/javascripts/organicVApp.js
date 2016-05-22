/**
 * Created by elshaarawy on 17-May-16.
 */

//angular script

var app = angular.module('organicApp', ['ngRoute','ngResource','ngMaterial']).run(function($rootScope,$http,$location){
    $rootScope.authenticated = false;
    $rootScope.current_user="";
    $rootScope.current_user_id="";

    $rootScope.logout = function(){
        $http.get('/auth/signout').success(function(){
            $rootScope.authenticated = false;
            $rootScope.current_user="";
            $location.path('/');
        });
    }


});


app.config(function($routeProvider) {

    $routeProvider
    //main
        .when('/',{
            templateUrl :'main.html',
            controller: 'mainController'
        })
        .when('/login',{
            templateUrl :'login.html',
            controller: 'authController'
        })
        .when('/signup',{
            templateUrl :'register.html',
            controller: 'authController'
        })
        //vegetables
        .when('/profile',{
            templateUrl :'profile.html',
            controller: 'vController'
        })
        //fruit
        .when('/cart',{
            templateUrl :'cart.html',
            controller: 'cartController'
        })
        //grass
        .when('/grass',{
            templateUrl :'grass.html',
            controller: 'gController'
        });

});

app.factory('catFactory',function($resource){
   return $resource('/cat');
});
app.factory('cartFactory',function($resource,$rootScope){
    return $resource('/cart/'+$rootScope.current_user_id);
})

app.controller('mainController', function($scope,$rootScope,$mdToast,$document,$log,$http,catFactory){

    var tabs = catFactory.query(),
        selected = null,
        previous = null;
    $scope.tabs = tabs;
    $scope.selectedIndex = 2;
    $scope.$watch('selectedIndex', function(current, old){
        previous = selected;
        selected = tabs[current];
        if ( old + 1 && (old != current)) $log.debug('Goodbye ' + previous.title + '!');
        if ( current + 1 )                $log.debug('Hello ' + selected.title + '!');
    });
    $scope.qt=0 ;
    if ($rootScope.authenticated){

        $scope.addToCart = function(pro_id,pro_name,qt) {
            var URI = "/cart/"+$rootScope.current_user_id+"?pro_id="+pro_id;
            $http.post(URI,{qt:1}).success(function(data){

                var message = data.nModified?'1Kg '+pro_name+' added':"Added Before";
                $mdToast.show(
                    $mdToast.simple()
                        .textContent(message)
                        .parent($document[0].querySelector('#toastContainer'))
                        .position('top right')
                        .hideDelay(700)
                );
            });
        }
    }
});



app.controller('authController', function($scope,$rootScope ,$location,$http){

    $scope.user = {firstName:"",lastName:"",username:"",password:"",address:""};
    $scope.error="";

    $scope.login = function(){
        $http.post('/auth/login',$scope.user).success(function(data){
            if (data.customer){
                $rootScope.authenticated=true;
                $rootScope.current_user = data.customer.firstName;
                $rootScope.current_user_id = data.customer._id;
                $location.path('/');
            }
            else {
                $scope.error  = data.message;
            }
        });
    }
    $scope.signUp = function() {
        $http.post('/auth/signup', $scope.user).success(function (data) {
            if (data.customer){
                $rootScope.authenticated=true;
                $rootScope.current_user = data.customer.firstName;
                $rootScope.current_user_id = data.customer._id;
                $location.path('/');
            }
            else {
                $scope.error  = "Registered User";
            }
        });
    }
});

app.controller('cartController', function($scope,cartFactory,$rootScope,$location,$http){
    if ($rootScope.authenticated){
    var cartProducts = cartFactory.query();
    $scope.cartProducts = cartProducts;}
    $scope.productActive = new Array(cartProducts.length);




    $scope.removeCartItem = function(item,i){

        $http.delete('/cart/'+$rootScope.current_user_id+'?pro_id='+item).success(function(){
            $scope.productActive[i]=true;
            $scope.cartProducts=cartFactory.query();

        });
    }

});

app.controller('fController', function($scope){

});

app.controller('gController', function($scope){

});