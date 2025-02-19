const express = require('express')
const path = require('path')
const app = express()
const https = require('https')
var fs = require('fs')

app.use(express.static(path.join(__dirname, '')))

app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, '', 'index.html'))
})
app.listen(3000)

/* FOR SSL 

[ec2-user@ip-172-31-21-252 jarvis]$ sudo chmod 755 /etc/letsencrypt/live/
[ec2-user@ip-172-31-21-252 jarvis]$ sudo chmod 755 /etc/letsencrypt/archive/


https.createServer({
  key: fs.readFileSync("/etc/letsencrypt/live/app.dev.sensaii.com/privkey.pem"),
  cert: fs.readFileSync("/etc/letsencrypt/live/app.dev.sensaii.com/cert.pem")
}, app)
.listen(3000);
*/
