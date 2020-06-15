const sgMail=require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail=({email,name})=>{
    sgMail.send({
        to:email,
        from:"yaman2661@gmail.com",
        subject:'Thanks for joining in !!!',
        text:`Welcome to the app ${name}.Let me know how you get along with the app.`
    })
}

const sendCancellationEmail=(email,name)=>{
    sgMail.send({
        to:email,
        from:'yaman2661@gmail.com',
        subject:'Sorry to let you go!',
        text:`Goodbye,${name}.I hope to see you some time soon`
    })
}

module.exports={
    sendWelcomeEmail,sendCancellationEmail
}