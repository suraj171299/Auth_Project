import { VERIFICATION_EMAIL_TEMPLATE } from "./emailTemplates.js"
import { mailtrapClient, sender } from "./mailtrap.config.js"

export const sendVerificationEmail = async (email, verificationToken) => {
    const recipient = [{email}]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            subject: "Verify your email",
            html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}",verificationToken ),
            category: "Email Verification"
        })

        console.log("Email sent successfully", response);
    } catch (error) {
        console.error(`Error sending verification email`, error)
        throw new Error(`Error sending verification email: ${error}`)
    }
}

export const sendWelcomeEmail = async (email, username) => {
    const recipient = [ { email } ]

    try {
        const response = await mailtrapClient.send({
            from: sender,
            to: recipient,
            template_uuid: "0ef32948-3442-4587-a30c-17a31ff1d391",
            template_variables: {
                "company_info_name": "Suraj Auth Company",
                "name": username
            }
        })

        console.log("Email sent successfully", response);
    } catch (error) {
        console.error(`Error sending verification email`, error)
        throw new Error(`Error sending verification email: ${error}`)
    }
}