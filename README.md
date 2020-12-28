# slackFileMgr

A simple node.js web app to delete uploaded Slack files. Slack does not have a way to bulk-delete uploaded files, so this app will allow a user to remove his/her files, or an admin to remove files on everyone's behalf.

---
## Getting Started

All you need to provide is a `.env` file in the same directory as the app.js file. You will need all of the following lines:
```
CLIENT_ID = xxxxxxxxxxx.xxxxxxxxxxx
CLIENT_SECRET = xxxxxxxxxxxxxxxxxxxxxxxxxxx
REDIRECT_URI = http%3A%2F%2Flocalhost%3A5050%2Fredirect
```

The following line is optional, if you want to give the an slack/app admin superuser access:

```
ADMIN_EMAIL = hotpantsk@gmail.com
```

This file can be created easily with a simple command line utility by using the following command:

`npm run setup`

---
## Running the app

Start the app using the following command:

`npm run start`


Once logged in, you will see a simple table of your files. You can delete them one at a time by clicking the file itself. There are also options to delete all files, or those > 10 or 30 days old.

**HEAD'S UP**: *If there are a bunch of files, this program may falsely inform you the file list is empty. You may be required to  refresh the list of files and run the delete again to truly get rid of them, as I have not implemented pagination on the files list yet. There is also no limiting, so it's possible you might see Slack rate limiting if you're deleting a ton of files.* 

