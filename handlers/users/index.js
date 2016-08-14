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
    return "INSERT INTO "+ users_table +" (phone, fcm_id, name) values ('"+ phone + "','" + fcm_id + "','" + name + "';";
}

function pgconn(query, error, success){
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query(query, function(err, result) {
        done();
        if (err){ 
            console.error(err); response.send("Error " + err);
            error();
        }
        else
            success(result);
        });
    });
}

function isUserRegistered(phone, callback, response){
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query(getCheckUserSql(phone), function(err, result) {
        done();
        if (err){ 
            console.error(err); response.send("Error " + err); 
        }
        else
            callback(result.rows)
        });
    });
}

var sendUsersList = function(response){
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query(getUserSql(), function(err, result) {
        done();
        if (err){ 
            console.error(err); response.send("Error " + err); 
        }
        else { 
                // response.writeHead(200, {"Content-Type": "application/json"});
                response.send(result.rows ); 
            }
        });
    });
}

function registerUser(request, response){
    // TODO: Disallow duplicates
    var phone =  request.body.phone,
        fcm_id = request.bodyfcm_id,
        name = request.body.name;

    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query(getInsertUserSql(phone, fcm_id, name), function(err, result) {
        done();
        if (err){ 
            console.error(err); response.send("Error " + err); 
        }
        else { 
                response.send("Registered OK!"); 
            }
        });
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
    
    var onUserValidated = function(rows){
        if(rows.length > 0){
            sendUsersList(response);
        }
        else{
            response.status(401).send('Unauthorized user');
        }
    
    }
    isUserRegistered(phone, onUserValidated, response);
}

module.exports.getUsers = getUsers;
module.exports.registerUser = registerUser;