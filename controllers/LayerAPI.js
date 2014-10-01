/*
The MIT License (MIT)

Copyright (c) 2013-2014 CNRS

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

/* The API controller
   Exports 3 methods:
   * post - Creates a new layer
   * listAll - Returns a list of layers
   * listWithId - Returns a specific layer of a given id
*/
var Media = require('../models/Media').Media; //get the media model for cross-check
var Layer = require('../models/Layer').Layer; //get the layer model

var ACL = require('../models/ACL').ACL,
	ACLAPI = require('../controllers/ACLAPI'),
	Group = require('../models/Group').Group,
	compound = require('../controllers/CompoundAPI'),
	commonFuncs = require('../lib/commonFuncs');

/*
	- First: retrieves all layers regardless of user/group's rights
	- Second: finds all groups belonging to the connected user
	- For each found layer, check ACLs (the permission of the connected user and its groups)
	- If not found, do a back propagation
*/
exports.listAll = function(req, res){
	function final(resultReturn, n) { 
		if (resultReturn.length == 0 && n > 0) res.status(403).json({error:"You dont have enough permission to get this resource"});
		else res.status(200).json(resultReturn);
	}
	Layer.find({id_media : req.params.id_media}, function(error, data){																		//find all layers under this media
		if (error) res.status(400).json({error:"error", message:error});
		else {
			var connectedUser = req.session.user;
			if (GLOBAL.no_auth == true || (connectedUser != undefined && connectedUser.role == "admin")) res.status(400).json(data);
			else if (connectedUser != undefined && data != null){
				//first find all groups to which the connecteduser belongs
				Group.find({'usersList' : {$regex : new RegExp('^'+ connectedUser.username + '$', "i")}}, function(error2, dataGroup) {
					if (error2) res.status(400).json({error:"error", message:error2});
					else {
						result = [];
						resultReturn = [];
						for(var i = 0; i < data.length; i++) result.push(data[i]._id);
						ACL.find({id:{$in:result}}, function(error3, dataACL){																// find all acls of these id
							if (error3) res.status(500).json({error:"error in ACL-corpusListall:", message:error3});
							else if (dataACL != null) {
								var dataACLLen = dataACL.length;
								var countTreatedACL = 0;
								for(var i = 0; i < dataACL.length; i++){
									var foundPos = commonFuncs.findUsernameInACL(connectedUser.username, dataACL[i].users);
									if (foundPos != -1) {
										if (dataACL[i].users[foundPos].right != 'N'){
											resultReturn.push(data[i]);
											countTreatedACL += 1; 
										}
									} 
									else {																									//not found this user's right on the current resource, look for its group's one
										foundPos = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL[i].groups);
										if (foundPos != -1) {
											if (dataACL[i].groups[foundPos].right != 'N') {
												resultReturn.push(data[i]);
												countTreatedACL += 1; 
											}
										}
										else { 														//not found user right, nor group one, do a back propagation
											(function(d){
												parentID = [];
												parentID.push(req.params.id_media); 
												parentID.push(req.params.id_corpus);
												ACL.find({id:{$in:parentID}}, function(error4, dataACL1){
													if (error4) res.status(400).json({error:"error", message:error4});
													else if (dataACL1 != null) {
														countTreatedACL += 1;
														var contd = true;
														for(var j = 0; j < dataACL1.length && contd; j++) {
															var foundPos = commonFuncs.findUsernameInACL(connectedUser.username, dataACL1[j].users);														
															if (foundPos != -1) {
																if (dataACL1[j].users[foundPos].right != 'N') {
																	resultReturn.push(d); 
																	contd = false;
																}
															}
															else {
																foundPos = commonFuncs.findUsernameInGroupACL(dataGroup, dataACL1[j].groups);							
																if (foundPos != -1) {
																	if (dataACL1[j].groups[foundPos].right != 'N') {
																		resultReturn.push(d); 
																		contd = false;
																	}
																	else contd = false; 							// stop because we already found the right N
																}
															}
														} 
														if (countTreatedACL == dataACLLen) {
															countTreatedACL = -1
															final(resultReturn, data.length);
														}
													} 
												}); 
											})(data[i]); 
										}
									} 
								} 
								if (countTreatedACL == dataACLLen) final(resultReturn, data.length);
							} 
							else res.status(400).json({error: "error in finding acl"});
						}); 
					} 
				});
				
			} 
			else {
				if (data != null) res.status(400).json({error: "You dont have permission to access this resource"}); 
				else return([]);
			}
		}
	});
}

exports.listWithId = function(req, res){
	Layer.findById(req.params.id_layer, function(error, data){
		if (error) res.status(400).json({error:"error", message:error});
		else if (data == null) res.status(400).json({error:'no such id_layer!'})
		else res.status(200).json(data);
	});
}

exports.post = function(req, res){
	if (req.body.layer_type == undefined || req.body.fragment_type == undefined || req.body.data_type == undefined || req.body.source == undefined) return res.status(400).json({error: "one or more data fields are not filled out properly"});
	if (req.body.annotation != undefined) return compound.postAll(req, res);
	else {
		Media.findById(req.params.id_media, function(error2, data){
			if (error2) res.status(400).json({error:"error", message:error2});
			else if (data == null){
				res.status(400).json({error:'Could not post this layer because the given id_media is incorrect'}); 
				return;
			}
			else {
				var layer_data = {
					"id_media" : req.params.id_media,
					"layer_type" : req.body.layer_type,
					"fragment_type" : req.body.fragment_type,
					"data_type" : req.body.data_type,
					"source" : req.body.source,
					"history" : []
				};
			
				var connectedUser = "root";
				if (req.session.user) connectedUser = req.session.user.username;

				var layer = new Layer(layer_data);																	// add new layer

				var modified = {
					"id_media" : req.params.id_media,
					"layer_type" : req.body.layer_type,
					"fragment_type" : req.body.fragment_type,
					"data_type" : req.body.data_type,
					"source" : req.body.source
				};

				layer.history.push({name : connectedUser, date : new Date(), modification: modified});				// update history
				layer.save( function(error3, dataLayer){														// save new layer	
					if (error3){
						res.status(400).json({error:"error", message:error3});
						return;
					}
					else{
						ACLAPI.addUserRightGeneric(dataLayer._id, connectedUser, 'A');								// add the current id to the ACL list
						res.status(200).json(dataLayer);
					}
				});
			}
		});
	}
}

exports.updateAll = function(req, res){

	if (req.body.layer_type == undefined && req.body.fragment_type == undefined && req.body.data_type == undefined && req.body.source == undefined) return res.status(400).json({error:"one or more data fields are not filled out properly"});



	var update = {};
	if (req.body.id_media) update.id_media = req.params.id_media;
	if (req.body.layer_type) update.layer_type = req.body.layer_type;
	if (req.body.fragment_type) update.fragment_type = req.body.fragment_type;
	if (req.body.data_type) update.data_type = req.body.data_type;
	if (req.body.source) update.source = req.body.source;
			
	Layer.findByIdAndUpdate(req.params.id_layer, update, function (error, oneLayer) {
		if (error) res.status(400).json({error:"error", message:error});
		else {
			var dateNow = new Date();
			var uname = "root";
			if (req.session.user) uname = req.session.user.username;
			oneLayer.history.push({name:uname, date: dateNow, modification: update});
			oneLayer.save( function(error2, data){
				if (error2) res.status(400).json({error:"error", message:error2});
				else res.status(200).json(data);
			});
		}
	});
}