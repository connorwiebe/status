const sgMail = require('@sendgrid/mail')
const dev = process.env.NODE_ENV === 'development'
sgMail.setApiKey(process.env.SENDGRID)

module.exports = args => {

  args.message.push('status')

  const msg = {
    subject: args.subject,
    from: { name: 'status', email: 'alerts@status123.herokuapp.com' },
    to: args.to,
    html: args.message.join('<br><br>')
  }

  return sgMail.send(msg)

}
