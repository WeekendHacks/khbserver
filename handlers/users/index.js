/*
*
* Author : Parag
*
*/

var pg = require('pg');
var users_table = 'users';

function getCheckUserSql(phone){
    return 'SELECT * FROM '+ users_table + ' WHERE phone = ' + phone + ';';
}

function getUserSql(){
    return 'SELECT * FROM '+ users_table + ';';
}

function isUserRegistered(phone, callback){
    pg.connect(process.env.DATABASE_URL, function(err, client, done) {
        client.query(getCheckUserSql(phone), function(err, result) {
        done();
        if (err)
            { console.error(err); response.send("Error " + err); }
        else
            // { response.render('pages/db', {results: result.rows} ); }
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
                response.writeHead(200, {"Content-Type": "application/json"});
                response.send(result.rows ); 
            }
        });
    });
}

function getUsers(request, response){
	// check if user already registered
    var phone = request.param('phone');
    if(!phone){
        response.status(400).send('No phone number');
        return;
    }
    
    
    var onUserValidated = function(rows){
        if(rows.length > 0){
            sendUsersList();
        }
        else{
            res.status(401).send('Unauthorized user');
        }
    
    }
    isUserRegistered(phone, onUserValidated);
	
}

module.exports.getUsers = getUsers;