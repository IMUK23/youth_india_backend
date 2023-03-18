import express from 'express'

import { createRequire } from "module";
const require = createRequire(import.meta.url);

const { google } = require('googleapis');
const { OAuth2 } = google.auth;

export const router=express.Router();

/*As we used the post request in front end*/

router.get('/rest/v1/calendar/init/',GoogleCalendarInitView);
router.get('/rest/v1/calendar/redirect/',GoogleCalendarRedirectView);


const oAuth2Client = new OAuth2(
    "789493418164-5henlj2520ni11rvj5ek0i8tpsg0pu6g.apps.googleusercontent.com",
    "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",
    "https://youth-india-backend-imuk23.vercel.app/rest/v1/calendar/redirect/"
  );
  
  const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];
  
function GoogleCalendarInitView(req, res) {
const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
});
res.redirect(url);
}

function GoogleCalendarRedirectView(req, res) {
const { code } = req.query;
if (code) {
    oAuth2Client.getToken(code, (err, tokens) => {
    if (err) {
        console.error('Error retrieving access token', err);
        res.status(400).send('Error retrieving access token');
        return;
    }
    oAuth2Client.setCredentials(tokens);
    const calendar = google.calendar({ version: 'v3', auth: oAuth2Client });
    calendar.events.list({
        calendarId: 'primary',
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
    }, (err, response) => {
        if (err) {
        console.error('The API returned an error:', err);
        res.status(400).send('Error retrieving calendar events');
        return;
        }
        const events = response.data.items;
        if (events.length) {
        console.log('Upcoming 10 events:');
        events.map((event, i) => {
            const start = event.start.dateTime || event.start.date;
            console.log(`${start} - ${event.summary}`);
        });
        res.status(200).send(events);
        } else {
        console.log('No upcoming events found.');
        res.status(200).send('No upcoming events found.');
        }
    });
    });
} else {
    res.status(400).send('Code not found in request parameters');
}
}