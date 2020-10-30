## API in NodeJS using ExpressJs to send mail using Gmail REST API
---
### Instructions to Run :

``` bash 
# Clone the repo 
$ git clone https://github.com/HaswanthVoonna/node-gmail.git

# Install node modules
$ npm i

# Run the API
$ npm run start
```

To execute create a credentials.json from the GMAIL API dashboard   

Routes :    
Home : http://localhost:3000/ | Request type : GET   
Authorization : http://localhost:3000/auth | Request type : GET   
Authorization Status : http://localhost:3000/status | Request type : GET   
Send Mail : http://localhost:3000/send | Request type : POST and GET   

Steps to send mail:   

1) GET request to /auth to trigger the authentication process   
2) GET request to /status to check the status of your authorization   
3) GET request to /send to send the mail   

