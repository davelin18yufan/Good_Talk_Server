import { RESEND_API_KEY, EMAIL_SENDER } from "@/constants/config"
import { Resend } from "resend"

const resend = new Resend(RESEND_API_KEY!)

/**
 * Send Reset password email
 * @param to - Receiver address.
 * @param content - Email content.
 */
export const sendEmail = async (to: string, content: string) => {
  try {
    await resend.emails.send({
      from: EMAIL_SENDER,
      to: [to],
      subject: "Password Reset Request",
      html: content,
    })
  } catch (error) {
    console.error("Error sending reset email:", error)
    throw error
  }
}
