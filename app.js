const express = require('express');
const app = express();
const ejs = require('ejs');
const router = express.Router();
const dotenv = require('dotenv');

//import twitter api package
const Twit = require('twit');

//import youtube api package
const Youtube = require('youtube-node');

dotenv.config();
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');

//import another .js file
const command = require('./DBcommand.js');

//set the app to use the express,bodyparser,and  external css
app.use(bodyParser.json());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
router.use(bodyParser.urlencoded({ extended: true }));

app.use('/', router);

//get the default page when user access 'localhost:8080/'
router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname + '/main.html'));
});

//get the movie page when user access 'localhost:8080/movie'
router.get('/movie', (req, res) => {
    res.sendFile(path.join(__dirname + "/moviePage.html"));
});

//get the admin-dashboard page when user access 'localhost:8080/admin-dashboard'
router.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname + '/adminPage.html'));
});

//get the addUser page when user access 'localhost:8080/user/new'
router.get('/user/new', (req, res) => {
    res.sendFile(path.join(__dirname + "/addUser.html"));
});

//get the editUser page when user access 'localhost:8080/user/edit'
router.get('/user/edit', (req, res) => {
    res.sendFile(path.join(__dirname + "/editUser.html"));
});

//check the user and password before user can access specfic website for them
router.post('/', async (req, res) => {
    var username = req.body.username;
    var password = req.body.password
    console.log(password);
    var key = req.headers.authorization;
    // To authenticate between request header and the key set in the environment 
    if(process.env.AUTH_KEY === key){
        // To check whether this user is a normal user or an admin
        var role = await command.checkRole(username, password);
        if(role == 'user' || role == 'admin'){
            // Update login log of this user
            command.updateLogin(username, password);
            return res.json(role);
        }
    }
});

//Get the result of all users when server receive POST method from client "localhost:8080/admin-dashboard"
router.post('/admin-dashboard', async (req,res) => {             
    // List all user and return it to client-side
    var result = await command.listAllUser();
    res.json(result);
    res.end();
});

/*Get user information according to the user id */
router.post('/user/get',  (req, res) => {
    var id = req.body.id;
    command.getUser(id)
    res.json('success');
    res.end();
});

//Get the result when server receive GET method from client "localhost:8080/user/get/info"
router.get('/user/get/info', async (req, res) => {
    // Get user information from a temporary table to be used in edit user information page
    // After getting those information, delete it from the temporary table
    var result = await command.getUserTemp();
    command.deleteUserTemp();
    res.json(result);
    res.end();
});

//Create a new user when server receive POST method from client "localhost:8080/user/new"
router.post('/user/new', (req, res) => {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var address = req.body.address;
    var age = req.body.age;
    var preferences = req.body.preferences;
    var email = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    // Add user information into the database
    command.addUserInfo(firstname, lastname, address, age, preferences, email, username, password);
});

//Edit a user when server receive POST method from client "localhost:8080/user/edit"
router.post('/user/edit',  (req, res) => {
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var address = req.body.address;
    var age = req.body.age;
    var preferences = req.body.preferences;
    var email = req.body.email;
    var id = req.body.id;
    // Update new user information into the database
    command.updateUserInfo(firstname, lastname, address, age, preferences, email, id);
    res.json('success');
    res.end();
});

//Delete a user when server receive POST method from client "localhost:8080/user/delete"
router.post('/user/delete', (req, res) => {
    var id = req.body.id;
    // Delete this user from the database by using user id
    command.deleteUserInfo(id);
    res.json(id);
    res.end();
});

//Send a youtube api request to youtube web service when server receive POST method from client "localhost:8080/youtube"
router.post('/youtube', function (req, res) {
    //Get the text from html body
    var requestdata = req.body.Datainfor;
    //Create new youtube object
    var youtube = new Youtube();
    //set api key for youtube api
    youtube.setKey('AIzaSyDEFLetqBXx6AUcs6CTh8s2spDnulVmEVo');
    //Use youtube api for searching the video
    youtube.search(`${requestdata} Trailer`, 1, function (error, result) {
        if (error) {
            console.log(error);
        } else {
            //get the result from JSON
            var videoresult = result.items;
            //use map to loop for each item in items array
            videoresult.map(function (results) {
                //Get each specfic value from JSON
                let embed = "https://www.youtube.com/embed/" + results.id.videoId;
                //create html template<iframe></iframe> to send it to client side<HTML>
                let Play = `<iframe width="420" height="315" src="${embed}"></iframe>`
                //send the data back to client<HTML>
                res.status(200).send({status:'Sent()',code:201,message:'Video',data:Play});
                res.end();
            })
            
        }
    })
})

//Send a twitter api request to twitter web service when server receive POST method from client "localhost:8080/twitter"
router.post('/twitter',function(req,res){
    //set header 
    res.setHeader("Content-Type","application/json");
    //Get the text from html body
    var requestdata = req.body.Datainfor;
    //set variable for amount of result that we want
    var tweetsnum = 5;
    //create new twitter api object that contains the api key to connect the server
    var Twitterr = new Twit({
        consumer_key: 'zLO8eptK5HZBYMlJRewrjyefl',
        consumer_secret: 'c0Ec01mnm2ZuDPOTkyTWLGefmEC9qDEKByHXxX3FWCFmqqN42f',
        access_token: '717612598695309313-nfRpp858GwEDO67M6O0RpLDx40zOtSo',
        access_token_secret: 'YQTJqqlGPvpiDlsKHP7iiUJpScBhA8kBtWZbtD6OBtsj4',
    })
    //send the api request to twitter web service
    Twitterr.get("search/tweets", {
        //set the movie that user want to search
        q: `${requestdata} Movies`,
        count: tweetsnum
    }, function (err, data, response) {
        if(err)
        {
            throw err
        }
        else
        {
            //get the result from JSON
            var tweetsresult = data.statuses;
            //array for sendind it back to client
            var Tweetdata;
            //the outer array that use to warp all array together
            var tweetarray = [];
            //use map to loop for each item in items array
            tweetsresult.map(function (results){
                //Get each specfic value from JSON
                var name = results.user.screen_name;
                var text = results.text;
                var time = results.created_at;
                //create variable to store htnl template
                var output = "";
                //create html template<iframe></iframe> to send it to client side<HTML>
                output += '<div class="card" style="width: 18rem;">';
                output += '<div class="card-body">';
                output += `<h5 class="card-title">${name}</h5>`; 
                output += `<h6 class="card-subtitle mb-2 text-muted">${time}</h6>`; 
                output += `<p class="card-text">${text}</p>`;   
                output += '</div></div>';
                //out the html template into array
                Tweetdata = {
                    template : output
                }
                //put array into the outer array
                tweetarray.push(Tweetdata);
            })
                //send the data back to client
                res.status(200).send({data:tweetarray});
        }
    })
})

//if user access to other pages instead of we assigned then it will link to main page
router.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/main.html'));
});

//start server with the specfic port
app.listen(process.env.PORT, function () {
    console.log("Server listening at Port " + process.env.PORT);
});