import { FRONTEND_URL } from "@/constants/config"

interface EmailTemplateOptions {
  title: string
  username: string
  message: string
  buttonText?: string
  buttonLink?: string
  warningText?: string
  additionalContent?: string
}

export const generateEmailTemplateBase = ({
  title,
  username,
  message,
  buttonText,
  buttonLink,
  warningText,
  additionalContent,
}: EmailTemplateOptions): string => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>【Good Talk】${title}</title>
      <style>
        body {
          margin: 0;
          padding: 0;
          background-color: #CAC6BD;
          font-family: 'SimSun', Arial, sans-serif;
        }
        .container {
          max-width: 600px;
          margin: 40px auto;
          padding: 20px;
          background-color: #f2efef;
          border-radius: 8px;
          box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
          text-align: center;
          position: relative;
        }
        h1 {
          color: #030712;
          font-size: 24px;
          margin-bottom: 16px;
        }
        p {
          color: #222831;
          font-size: 16px;
          margin: 16px 0;
        }
        .logo-container {
          position: absolute;
          left: 0;
          top: 0;
          background-color: #CAC6BD;
          padding: 0.5rem;
          transform-origin: top left;
          transform: perspective(600px) rotateX(0deg);
          box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
          transition: transform 0.5s ease, box-shadow 0.5s ease;
          cursor: pointer;
          clip-path: polygon(0% 0%, 100% 0%, 100% 92%, 90% 100%, 0% 100%);
          background: linear-gradient(135deg, #CAC6BD 90%, #A37F6F 10%);
          overflow: hidden;
        }
        .logo-container:hover {
          transform: perspective(600px) rotateX(-20deg) scaleY(1.02);
          box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.3);
        }
        .button {
          display: inline-block;
          padding: 12px 24px;
          background-color: #BB9A88;
          color: #fff;
          text-decoration: none;
          font-size: 16px;
          font-weight: bold;
          border-radius: 6px;
          margin: 20px 0;
          transition: transform 0.3s ease, background-color 0.3s ease;
        }
        .button:hover {
          background-color: #A37F6F;
        }
        .warning {
          font-size: 14px;
          color: #565757;
          margin-top: 24px;
        }
        .footer-container {
          padding: 20px;
          font-size: 12px;
          color: #222831;
          background-color: #B5A8A0;
          text-align: center;
        }
        .footer-container p {
          margin: 5px 0;
        }
        .footer-container a {
          color: #222831;
          text-decoration: underline;
        }
        .footer-buttons {
          margin-top: 15px;
        }
        .footer-buttons a {
          display: inline-block;
          padding: 10px 20px;
          font-size: 14px;
          border-radius: 4px;
          text-decoration: none;
          margin-right: 10px;
        }
        .footer-buttons a:last-child {
          background-color: #CAC6BD;
          color: #030712;
          border: 1px solid #A37F6F;
        }
        .footer-buttons a:first-child {
          background-color: #BB9A88;
          color: #030712;
          border: 1px solid #A37F6F;
        }
      </style>
    </head>
    <body>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td align="center">
            <div class="container">
              <a href="${FRONTEND_URL}" class="logo-container">
                <img src="/public/logo.svg" alt="Logo" style="height: 40px;">
              </a>
              <h1>${title}</h1>
              <p>Hi ${username}, ${message}</p>

              ${
                buttonText && buttonLink
                  ? `<a href="${buttonLink}" class="button">${buttonText}</a>`
                  : ""
              }

              ${warningText ? `<p class="warning">${warningText}</p>` : ""}

              ${additionalContent || ""}
            </div>
          </td>
        </tr>
        <tr>
          <td align="center" class="footer-container">
            <p>© ${new Date().getFullYear()} GoodTalk</p>
            <a href="#">Unsubscribe</a>
            <div class="footer-buttons">
              <a href="${FRONTEND_URL}">About us</a>
              <a href="${FRONTEND_URL}">Back to site</a>
            </div>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `
}

/**
 * reset password email template
 * @param resetLink - link to reset page
 * @param username - user name
 * @returns
 */
export const generateResetEmailTemplate = (
  resetLink: string,
  username: string
) => {
  return generateEmailTemplateBase({
    title: "密碼重設",
    username,
    message: "請點擊下方按鈕重設您的密碼。",
    buttonText: "重設密碼",
    buttonLink: resetLink,
    warningText: "此連結將在 1 小時後失效。若非本人操作，請忽略此郵件。",
  })
}

export const generateRegisterEmailTemplate = (
  verifyLink: string,
  username: string
) => {
  return generateEmailTemplateBase({
    title: "帳號註冊驗證",
    username,
    message: "歡迎加入！請點擊下方按鈕完成帳號驗證。",
    buttonText: "驗證帳號",
    buttonLink: verifyLink,
    warningText: "此連結將在 2 小時後失效。若非本人操作，請忽略此郵件。",
  })
}

export const generateRegisterSuccessTemplate = (username: string) => {
  return generateEmailTemplateBase({
    title: "Welcome aboard！",
    username,
    message: "您的帳號已成功建立，歡迎使用我們的服務！",
    additionalContent: "<p>請至我們的網站體驗完整功能。</p>",
  })
}
