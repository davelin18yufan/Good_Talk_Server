import { RESEND_API_KEY, EMAIL_SENDER } from "@/constants/config"
import { generateResetEmailTemplate } from "@/helpers/email"
import { Resend } from "resend"

const resend = new Resend(RESEND_API_KEY!)

/**
 * Send Reset password email
 * @param to - Receiver address.
 * @param resetLink - link with reset token.
 * @param username - Receiver name.
 */
export const sendResetEmail = async (to: string, username:string, resetLink: string) => {
  try {
    const html = generateResetEmailTemplate(resetLink, username)
    await resend.emails.send({
      from: EMAIL_SENDER,
      to: [to],
      subject: "Password Reset Request",
      html,
    })
  } catch (error) {
    console.error("Error sending reset email:", error)
    throw error
  }
}
