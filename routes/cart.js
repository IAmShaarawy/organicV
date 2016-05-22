var express = require('express');
var router  = express.Router();
//Mongo requirement
var mongodb = require('mongodb');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/organic";


router.route('/:id?')
    .get(function(req,res){
        MongoClient.connect(url,function(err,db){
            if (!err){
                db.collection('customers').find({_id:new mongodb.ObjectID(req.params.id)}).toArray(function(err,data){
                    if(!err){
                        db.close();
                        return res.json(data[0].cart);
                    }
                    else {
                        db.close();
                        return res.send(500,err);
                    }
                });
            }
            else {
                return res.send(500,err);
            }
        });
    })
    .post(function(req,res){

        MongoClient.connect(url,function(err,db){
            if(!err){
                db.collection('categories').findOne({'products._id':new mongodb.ObjectID(req.query.pro_id) },{products:{$elemMatch:{ _id:new mongodb.ObjectID(req.query.pro_id)}}},function(err,data){
                    if(!err){
                        var newCartItem = {
                            _id:data.products[0]._id,
                            name : data.products[0].name,
                            price: data.products[0].price,
                            qt: data.products[0].qt,
                            r_qt: req.body.qt,
                            img_path: data.products[0].img_path
                        };
                        db.collection('customers').update({_id:new mongodb.ObjectID(req.params.id)},{$addToSet:{cart:newCartItem}},function(err,data){
                            if (!err){
                                db.close();
                                return res.json(data);
                            }
                            else {
                                db.close();
                                return res.send(500,err);
                            }
                        });
                    }else {
                        db.close();
                        return res.send(500,err);
                    }
                });
            }
            else {
                return res.send(500,err);
            }
        });
    })
    .put(function(req,res){
        var updatedProduct = {
            'cart.$.r_qt': req.body.qt
        };
        MongoClient.connect(url,function(err,db){
            if(!err){
                db.collection('customers').update({cart:{$elemMatch:{_id: new mongodb.ObjectID(req.query.pro_id) }}},{$set:updatedProduct},function(err,data){
                    if(!err){
                        return res.json(data);
                    }else {
                        db.close();
                        return res.send(500,err);
                    }
                })
            } else {
                return res.send(500,err);
            }
        });
    })
    .delete(function(req,res){

        MongoClient.connect(url,function(err,db){
            if(!err){
                if(req.query.pro_id){
                    db.collection('customers').update({_id:new mongodb.ObjectID(req.params.id)},{$pull:{cart:{_id:new mongodb.ObjectID(req.query.pro_id)}}},function(err,data){
                        if(!err){
                            db.close();

                            return res.send(data);
                        }else {
                            db.close();
                            return res.send(500,err);
                        }
                    });
                }
                else {
                    db.collection('customers').update({_id:new mongodb.ObjectID(req.params.id)},{$pull:{cart:{}}},function(err,data){
                        if(!err){
                            db.close();

                            return res.send(data);
                        }else {
                            db.close();
                            return res.send(500,err);
                        }
                    });
                }

            } else {
                return res.send(500,err);
            }
        });
    });

module.exports = router;