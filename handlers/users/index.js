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

function pgconn(query, error, success){
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query(query, function(err, result) {
        done();
        if (err){ 
            console.error(err); response.send("Error " + err);
            if(error){
                error();
            };
        }
        else
            success(result);
        });
    });
}

function isUserRegistered(phone, callback, response){
    pgconn(getCheckUserSql(phone), null, callback);
}

var sendUsersList = function(response){
    pgconn(getUserSql(), null, function(result){
        response.send(result.rows);
    });
}

function registerUser(request, response){
    // TODO: Disallow duplicates
    var phone =  request.body.phone,
        fcm_id = request.body.fcm_id,
        name = request.body.name,
        respObj = {message: "OK"};

    pgconn(getInsertUserSql(phone, fcm_id, name), null, function(){
        response.send(respObj); 
    });

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
        var rows = result.rows;
        if(rows.length > 0){
            sendUsersList(response);
        }
        else{
            response.status(401).send('Unauthorized user');
        }
    
    }
    isUserRegistered(phone, onUserValidated, response);
}

function requestLocation(request, response){
    var from = request.body.from,
        to = request.body.to;

    // pgconn(, null, function(result){
    //     response.send(result.rows);
    // });

}

function updateFcmId(request, response){

}

module.exports.getUsers = getUsers;
module.exports.registerUser = registerUser;
module.exports.requestLocation = requestLocation;
module.exports.updateFcmId = updateFcmId;