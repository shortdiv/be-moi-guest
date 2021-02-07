const {google} = require('googleapis');
const fs = require('fs')
require('dotenv').config()

const {
  CLIENT_EMAIL,
  PRIVATE_KEY
} = process.env

const authorize = async () => {
  const authClient = new google.auth.JWT({
    email: CLIENT_EMAIL,
    key: process.env.PRIVATE_KEY.replace(/\\n/g, '\n'),
    scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly']
  })
  try {
    await authClient.authorize()
    return authClient
  } catch (err) {
    console.log(err)
  }
}

const getData = async (sheetId, sheetTab, start, end) => {
  const authClient = await authorize()
  try {
    const sheets = google.sheets({version: 'v4', auth: authClient});
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range: `${sheetTab}!${start}:${end}`,
    });
    return res.data
  } catch(err) {
    console.log(err)
  }
}

module.exports = {
  getData
}
