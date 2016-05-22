
var LocalStrategy = require('passport-local').Strategy;
var bCrypt = require('bcrypt-nodejs');
var mongodb  =require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/organic";


module.exports = function(passport){

    passport.serializeUser(function(user,done){

        //tell passport which id use for user
        console.log('serialized user: ',user.email);
        done(null,user._id);
    });

    passport.deserializeUser(function(_id,done){

        MongoClient.connect(url,function(err,db){

            if (!err){
                db.collection('customers').findOne({_id:new mongodb.ObjectID(_id)},function(err,user){
                    if (!err){

                        db.close();
                        return done(err,user);
                    }
                    else {
                        db.close();
                        return done(err,false);
                    }
                })
            }
            else {
                db.close();
                return done(err,false);
            }
        });

    });

    //Login strategy
    passport.use('login',new LocalStrategy({
      passReqToCallback :true
    },
        function(req,username,password,done){

            //check user name existence

            MongoClient.connect(url,function(err,db){

                if (!err){
                    var customers = db.collection("customers");
                    customers.findOne({email:username},function(err,customer){
                       if (!err){
                           if (customer!=null){
                               if (isValidPassword(customer,password)){
                                   db.close();
                                   console.log("logged in"+JSON.stringify(customer));
                                   return done(null,customer);
                               }
                               else {
                                   db.close();
                                   console.log('invalid password');
                                   return done(null,false);
                               }
                           }
                           else {
                               db.close();
                               console.log("not exist user");
                               return done(null,false);
                           }
                       }
                       else{
                           db.close();
                           return done(err,false);
                       }
                    });
                }
                else {
                    db.close();
                    return done(err,false);
                }

            });

        })
    );

    //signUp strategy
    passport.use('signup', new LocalStrategy({
      passReqToCallback :true
    },
        function(req,username,password,done){
            MongoClient.connect(url,function(err,db){
                if (err){
                    console.log("error in connection");
                    return done("error in connection",false);
                }
                console.log("connected to mongo");
                var col_customers = db.collection('customers');

                col_customers.findOne({email:username},function(err,customer){
                    if (customer==null){
                        col_customers.insert({firstName:"new User",lastName:" New User",email:username,password:createHash(password),address:"not"}
                            ,{w:1}
                            ,function(err,result){

                                    console.log("inserted***"+JSON.stringify(result));
                                var updatedCustomer ={
                                    firstName : req.body.firstName,
                                    lastName : req.body.lastName,
                                    password:createHash(req.body.password),
                                    address: req.body.address
                                };
                                col_customers.update({email:username},{$set:updatedCustomer},function(err,data){
                                    if(!err){
                                        return done(null,result.ops[0]);
                                    }else {
                                        db.close();
                                        return res.send(500,err);
                                    }
                                });


                                });
                    }
                    else {
                        console.log("user exist");
                        db.close();
                        return done(null, false);
                    }
                });

            });
        }
    ));


    //helper functions
    var isValidPassword = function(customer,password){
        return bCrypt.compareSync(password,customer.password);
    };

    var createHash =function(password){
        return bCrypt.hashSync(password,bCrypt.genSaltSync(1),null);
    };

};