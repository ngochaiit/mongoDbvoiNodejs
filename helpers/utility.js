const nodemailer = require('nodemailer')
const PORT = 3000
const sendEmail = async (receiverEmail, secretKey) => {	    
    try {
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "ngochaiit0701@gmail.com", 
                pass: "Haihuyen12345"
            }
        })
        let mailOptions = {
            from: '"Techmaster Test" <ngochaiit0701@gmail.com>', //Email người gửi
            to: receiverEmail, 
            subject: 'Activate email',         
            html: `<h1>Please click here to activate your account:</h1>
                   http://${require('os').hostname()}:${PORT}/users/activateUser?secretKey=${secretKey}&email=${receiverEmail}` 
        }
        let info = await transporter.sendMail(mailOptions)
        console.log('Message sent: %s', info.messageId);
    } catch(error) {
        throw error
    }
}
module.exports = {
    sendEmail, 
    PORT   
}