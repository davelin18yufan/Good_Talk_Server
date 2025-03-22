import { RESEND_API_KEY, EMAIL_SENDER } from "@/constants/config"
import { generateResetEmailTemplate } from "@/helpers/email"
import { Resend } from "resend"

const resend = new Resend(RESEND_API_KEY!)

/**
 * Send Reset password email
 * @param to - Receiver address
 * @param resetLink - link with reset token
 */
export const sendResetEmail = async (to: string, resetLink: string) => {
  try {
    const html = generateResetEmailTemplate(resetLink)
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
