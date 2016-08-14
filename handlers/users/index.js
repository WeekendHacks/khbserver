/*
*
* Author : Parag
* Should be used as "Users"
* 
*
*/

var pg = require('pg');
var users_table = 'users';

function getCheckUserSql(phone){
    return 'SELECT * FROM '+ users_table + ' WHERE phone = ' + "'" + phone + "';";
}

function getUserSql(){
    return 'SELECT * FROM '+ users_table + ';';
}

function getInsertUserSql(phone, fcm_id, name){
    return "INSERT INTO "+ users_table +" (phone, fcm_id, name) values ('"+ phone + "','" + fcm_id + "','" + name + "');";
}

function getUpdateUserSql(phone, fcm_id, name){
    return "UPDATE " + users_table +
           " SET fcm_id = '" + fcm_id + "'," +
           "name = '" + name +"' WHERE phone = '" + phone + "';"; 
}

function executeQuery(query, error, success){
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query(query, function(err, result) {
            done();
            if (err){ 
                console.log("Error in sql");
                console.error(err);
                if(error){
                    error();
                };
            }
            else{
                success(result);
            }
        });
    });
}

function isUserRegistered(phone, error, success, response){
    console.log("Checking existing user");
    executeQuery(getCheckUserSql(phone), null, function(result){
        if(result.rows.length){
            console.log("User found");
            success(result);
        }
        else{
            console.log("NO User found");
            if(error){
                error();
            }
            else{
                console.log("Sending Unauthorized user");
                response.status(401).send('Unauthorized user');
            }
        }
    });
}

var sendUsersList = function(response){
    executeQuery(getUserSql(), null, function(result){
        console.log("Sending user list");
        response.send(result.rows);
    });
}

function registerUser(request, response){
    // TODO: Disallow duplicates
    var phone =  request.body.phone,
        fcm_id = request.body.fcm_id,
        name = request.body.name,
        respObj = {message: "OK"};

    var newUserRegister = function(){
                            executeQuery(getInsertUserSql(phone, fcm_id, name), null, function(){
                                console.log("Sending resp for New user");
                                response.send(respObj); 
                            });
                        }
    var updateExistingUser = function(result){
                                console.log("updating existing user");
                                executeQuery(getUpdateUserSql(phone, fcm_id, name), null, function(){
                                    console.log("Sending OK response");
                                    response.send(respObj); 
                                });
                             } 
    isUserRegistered(phone, newUserRegister, updateExistingUser, response);
    // ..
    // Else :  
    

}

function getUsers(request, response){
	// check if user already registered
    var phone = request.param('phone');
    // console.log('phone is', phone);
    if(!phone){
        response.status(400).send('No phone number');
        return;
    }
    
    var onUserValidated = function(result){
            sendUsersList(response);
    }
    isUserRegistered(phone, null, onUserValidated, response);
}

function requestLocation(request, response){
    var from = request.body.from,
        to = request.body.to;

    // executeQuery(, null, function(result){
    //     response.send(result.rows);
    // });

}

function updateFcmId(request, response){
    //
}

module.exports.getUsers = getUsers;
module.exports.registerUser = registerUser;
module.exports.requestLocation = requestLocation;
module.exports.updateFcmId = updateFcmId;