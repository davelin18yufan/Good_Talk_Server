import { RESEND_API_KEY, EMAIL_SERVER_DOMAIN } from "@/constants/config"
import { Resend } from "resend"

const resend = new Resend(RESEND_API_KEY!)

interface SendEmailProps {
  to: string[]
  subject: string
  content: string
}

/**
 * Sends an email.
 * @param params - An object containing email details.
 * @param params.to - The recipient's email address.
 * @param params.subject - The subject of the email.
 * @param params.content - The HTML content of the email.
 */
export const sendEmail = async ({ to, subject, content }: SendEmailProps) => {
  try {
    await resend.emails.send({
      from: EMAIL_SERVER_DOMAIN, // TODO: Create an email server domain
      to,
      subject,
      html: content,
    })
  } catch (error) {
    console.error("Error sending reset email:", error)
    throw error
  }
}
