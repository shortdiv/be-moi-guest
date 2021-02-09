const fastify = require('fastify')({ logger: true })
fastify.register(require('fastify-formbody'))
const axios = require('axios')
require('dotenv').config()
const { getData } = require("../utils/get-sheet-data.js")

const client = require('twilio')(process.env.ACCOUNT_SID, process.env.AUTH_TOKEN);
const MessagingResponse = require('twilio').twiml.MessagingResponse;

fastify.get('/', async (req, resp) => {
  return { hello: 'world' }
})

fastify.get('/sheet-data/:sheetId/:tab/:range', async(req, reply) => {
  try {
    return getData(req.params.sheetId, req.params.tab, req.params.range.split('-')[0], req.params.range.split('-')[1])
  } catch(err) {
    console.log(err)
  }
})

fastify.post('/callback', async(req, resp) => {
  const twiml = new MessagingResponse();
  const {SmsStatus, MessageStatus, From, ErrorMessage} = req.body;
  console.log(req.body)
  if (ErrorMessage != "") {
    twiml.message(`there's an error ${ErrorMessage}`)
    resp
      .code(400)
      .headers({
        'Content-Type': 'text/xml'
      })
      .send(twiml.toString());
    return resp
  }
  // {
  //   EventType: 'READ',
  //   ErrorCode: '63015',
  //   SmsSid: 'XXXXXX',
  //   SmsStatus: 'failed',
  //   MessageStatus: 'failed',
  //   ChannelToAddress: '+1500555XXXX',
  //   To: 'whatsapp:+15005550006',
  //   ChannelPrefix: 'whatsapp',
  //   MessageSid: 'XXXXX',
  //   AccountSid: 'XXXXXX',
  //   ErrorMessage: 'Twilio Error: [Account not associated with a sandbox]',
  //   From: 'whatsapp:+14155238886',
  //   ApiVersion: '2010-04-01'
  // }
  resp
    .code(200)
    .header('Content-Type','text/xml')
    .send("yay");
  return resp
})

fastify.post('/incoming', async(req, reply) => {
  const twiml = new MessagingResponse();
  const {MessagingServiceSid, MessageSid, From, Body} = req.body;

  try {
    const response = await axios({
      url: "http://3d7c02e71459.ngrok.io/sheet-data/1CI7Idz9klLYrP95h9eJallSx3QpGxrioPw2twLhRCyM/Approved/A1-H18",
      method: 'get'
    })
    // todo: really dumb logic will change this later
    const assoc = response.data.values.map(pap => pap)
    let str = ""
    assoc.slice(1, assoc.length - 1).map(time => {
      if (time.length > 1) {
        time.forEach((el, idx) => {
          str += `${time[0]} ${assoc[0][idx]} ${el}\n`
        })
      }
    })
    twiml.message(str);
    reply
      .code(200)
      .header('Content-Type','text/xml')
      .send(twiml.toString());
    return reply
  } catch(err) {
    console.log(err)
    return err
  }
})

// Run the server!
const start = async () => {
  try {
    await fastify.listen(3000)
  } catch (err) {
    fastify.log.error(err)
    process.exit(1)
  }
}
start()
