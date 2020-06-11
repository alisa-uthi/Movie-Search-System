const mysql = require('mysql');
var bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

/*To connect with the database */
const db = mysql.createConnection({
    host : process.env.DB_HOST,
    user : process.env.DB_USER,
    password : process.env.DB_PASSWORD,
    port : process.env.DB_PORT,
    database : process.env.DB_NAME
});
db.connect(function (err){
    if(err) throw err;
    console.log('Database is connected succesfully');
});

/*To check whether this user is user or admin */
async function checkRole(name, pwd){
    return new Promise((resolve) => {
        var sql = 'SELECT * FROM user_info WHERE username=\'' + name + '\'';
        db.query(sql, (err, data) => {
            if(err) throw err;
            //Compare between the received password and hash password in the database
            //To do the user authentication
            bcrypt.compare(pwd, data[0].password, function(err, result){
                if(result == true)
                    resolve(data[0].role);
            });
        }); 
    });
}
module.exports.checkRole = checkRole;

/*To keep track of login information of each user */
function updateLogin(username, password){
    var sql = 'INSERT INTO login_info (username, password) VALUES (\'' + username + '\', \'' + password + '\');';
    db.query(sql, (err,data) => {
        if(err) throw err;
        console.log('Login log of this user is recorded');
    });
}
module.exports.updateLogin = updateLogin;

/*To get all user information */
function listAllUser(){
    var sql = 'SELECT id, firstname, lastname, address, age, preferences, email FROM user_info WHERE role=\'user\';';
        return new Promise((resolve) => {
          db.query(sql, (err, data) => {
                if(err) throw err;
                resolve(data);  
            });
        });
}
module.exports.listAllUser = listAllUser;

/*To add user information into user_info table in database */
async function addUserInfo(firstname, lastname, address, age, preferences, email,username, password){
        const hashPassword = await bcrypt.hash(password, 10);
        var sql = 'INSERT INTO user_info (firstname, lastname, address, age, preferences, email, username, password, role) ' + 
              'VALUES (\'' + firstname + '\', \'' + lastname + '\', \'' + address + '\', ' + 
              age + ', \'' + preferences + '\', \'' + email + '\', \'' + username + '\', \'' + hashPassword +
              '\', \'user\');'; 
    db.query(sql, (err,data) => {
        if(err) throw err;
        console.log('1 record inserted..');
    });
}
module.exports.addUserInfo = addUserInfo;

/*
 *  getUser(), getUserTemp(), deleteUserTemp(), and updateUserInfo() 
 *  These functions are used for the purpose of editing and updating user information
 */

/*Get user information according to the user id and store it in a temporary table */
function getUser(id){
    var sql = 'INSERT INTO edit_temp ';
    sql += 'SELECT * FROM user_info ';
    sql += 'WHERE id=\'' + id + '\'';
    db.query(sql, (err, data) => {
        if(err) throw err;
        console.log('Update to temporary table');
    });    
}
module.exports.getUser = getUser;

/*Get user information from the temporary table */
function getUserTemp(){
    var sql = 'SELECT * FROM edit_temp;';
    return new Promise((resolve) => {
        db.query(sql, (err, data) => {
            if(err) throw err;
            resolve(data)
        });  
    })  
}
module.exports.getUserTemp = getUserTemp;

/* When the client-side already gets this user information from the temporary table,
   delete user information from the temporary table
*/
function deleteUserTemp(){
    var sql = 'DELETE FROM edit_temp;';
    db.query(sql, (err, data) => {
        if(err) throw err;
        console.log('Delete data in temporary table');
    });    
}
module.exports.deleteUserTemp = deleteUserTemp;

/*To update user information */
function updateUserInfo(firstname, lastname, address, age, preferences, email, id){
    var sql = 'UPDATE user_info SET ';
    sql += 'firstname=\'' + firstname + '\', ';
    sql += 'lastname=\'' + lastname + '\', ';
    sql += 'address=\'' + address + '\', ';                   
    sql += 'age=' + age + ', ';
    sql += 'preferences=\'' + preferences + '\', '; 
    sql += 'email=\'' + email + '\' ';    
    sql += 'WHERE id=\'' + id + '\';' 
    db.query(sql, (err, data) => {
        if(err) throw err;
        console.log('Update successfully');
    });
}
module.exports.updateUserInfo = updateUserInfo;

/*To delete user information from database by using user id */
function deleteUserInfo(id){
    var sql = 'DELETE FROM user_info WHERE id=\'' + id + '\';';
    db.query(sql, (err, data) => {
        if(err) throw err;
        console.log('Delete 1 record..');
    });
}
module.exports.deleteUserInfo = deleteUserInfo;