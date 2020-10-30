/*
To execute create a credentials.json from the GMAIL API dashboard

Routes : 
Home : http://localhost:3000/ | Request type : GET
Authorization : http://localhost:3000/auth | Request type : GET
Authorization Status : http://localhost:3000/status | Request type : GET
Send Mail : http://localhost:3000/send | Request type : POST and GET

Steps:
1) GET request to /auth to trigger the authentication process
2) GET request to /status to check the status of your authorization
3) GET request to /send to send the mail

*/
const app = require("express")();
const fs = require('fs');
const { google } = require('googleapis');
const bodyParser = require('body-parser')

//JSON parser from body-parser
var urlParser = bodyParser.urlencoded()


// View engine
app.set('view engine', 'ejs');


// Constants
var TOKEN_PATH = 'token.json';
const SCOPES = [
    'https://mail.google.com/',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send'
];

////////////////////////////////////////////////////////

app.get('/', (req, res) => {
    console.log(req.query)
    res.render('index.ejs')
})

////////////////////////////////////////////////////////

// used to create the oAuth url
function authorize(credentials) {
    const { client_secret, client_id, redirect_uris } = credentials.web;
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uris[0]);

    // Check if we have previously stored a token.
    const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
    });

    return authUrl;
}

app.get("/auth", (req, res) => {
    // Load client secrets from a local file.
    fs.readFile('credentials.json', (err, content) => {
        // Authorize a client with credentials, then call the Gmail API.
        redirect_url = authorize(JSON.parse(content))
        res.redirect(redirect_url)
    });
})

////////////////////////////////////////////////////////

app.get("/status", (req, res) => {
    fs.readFile('credentials.json', (err, content) => {
        const { client_secret, client_id, redirect_uris } = JSON.parse(content).web;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);

        // req.params have code
        if (req.query.code) {
            oAuth2Client.getToken(req.query.code, (err, tokens) => {
                if (err) return console.error('Error retrieving access token', err);
                oAuth2Client.setCredentials(tokens);
                // Store the token to disk for later program executions
                fs.writeFile(TOKEN_PATH, JSON.stringify(tokens), (err) => {
                    if (err) return console.error(err);
                });
            });

            res.send("<h2> Authorization Success </h2><p>Visit<a href= 'http://localhost:3000/send'> here </a> to send the mail</p>")
        } else {
            fs.readFile(TOKEN_PATH, (data, err) => {
                if (data) {
                    res.send("<h2> Authorization Failed </h2><p>Visit<a href= 'http://localhost:3000/auth'> here </a> to authorize</p>")
                } else {
                    res.send("<h2> Authorization Success </h2><p>Visit<a href= 'http://localhost:3000/send'> here </a> to send the mail</p>")
                }
            });
        }

    })
})

////////////////////////////////////////////////////////

function makeBody(to, from, subject, message) {
    var str = ["Content-Type: text/plain; charset=\"UTF-8\"\n",
        "MIME-Version: 1.0\n",
        "Content-Transfer-Encoding: 7bit\n",
        "to: ", to, "\n",
        "from: ", from, "\n",
        "subject: ", subject, "\n\n",
        message
    ].join('');

    var encodedMail = new Buffer(str).toString("base64").replace(/\+/g, '-').replace(/\//g, '_');
    return encodedMail;
}


app.get("/send", (req, res) => {
    res.render('form.ejs')
})


app.post('/send', urlParser, (req, res) => {
    fs.readFile('credentials.json', (err, content) => {
        const { client_secret, client_id, redirect_uris } = JSON.parse(content).web;
        const oAuth2Client = new google.auth.OAuth2(
            client_id, client_secret, redirect_uris[0]);


        var access_token
        fs.readFile('token.json', (err, content) => {
            access_token = JSON.parse(content).access_token
            oAuth2Client.credentials = { access_token: access_token }
            var raw = makeBody(req.body.to, req.body.from, req.body.subject, req.body.msg);
            const gmail = google.gmail({ version: 'v1', oAuth2Client });
            gmail.users.messages.send({
                auth: oAuth2Client,
                userId: 'me',
                resource: {
                    raw: raw
                }

            }, (err, response) => {
                if (err) {
                    res.send("<h2> ERROR : Mail not sent</h2>")
                } else {
                    res.send("<h2> Mail Sent </h2>")
                }
            });
        })


    })
})

////////////////////////////////////////////////////////

app.listen("3000", () => {
    console.log("Server listening to port 3000")
})