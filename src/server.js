const fastify = require('fastify')({ logger: true })
fastify.register(require('fastify-formbody'))
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
  twiml.message("your msg has been received");
  resp
    .code(200)
    .header('Content-Type','text/xml')
    .send(twiml.toString());
  return resp
})

fastify.post('/incoming', async(req, resp) => {
  const twiml = new MessagingResponse();
  const {MessagingServiceSid, MessageSid, From, Body} = req.body;
  const dialogflowResponse = (await sessionClient.detectIntent(
    text, id, Body)).fulfillmentText;

  twiml.message("your msg has been received");
  resp
    .code(200)
    .headers({
      'Content-Type': 'text/xml'
    })
    .send(twiml.toString());
  return resp
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
