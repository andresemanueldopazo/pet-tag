import emailClient from "@sendgrid/mail"
import { NextApiRequest, NextApiResponse } from "next"
import prisma from "../../lib/prisma"
const smsClient = require("twilio")(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

emailClient.setApiKey(process.env.EMAIL_SERVER_PASSWORD!)

type TextMsg = {
  from: string,
  to: string,
  body: string,
}

type EmailMsg = {
  to: string,
  from: string,
  subject: string,
  name: string,
  text: string,
}

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { code, latitude, longitude } = req.body
  const pet = await prisma.pet.findUnique({
    select: {
      name: true,
      parents: {
        select: {
          email: true,
          phoneNumber: true,
        },
      },
    },
    where: {
      tagCode: code,
    },
  })
  if (!pet) {
    return res.status(404).send({ message: "Pet not found" })
  }

  const textMsgs = pet.parents.reduce<TextMsg[]>((previusValue, currentValue) => {
    const phoneNumber = currentValue.phoneNumber
    return (phoneNumber ? (
      [...previusValue, {
        from: process.env.TWILIO_PHONE_NUMBER!,
        to: phoneNumber,
        body: `${pet.name} is at https://maps.google.com/?q=${latitude},${longitude}`,
    }]
    ) : (
      previusValue
    ))
  }, [])

  const resultsTextMsgs = textMsgs.map((textMsg) => {
    return smsClient.messages.create(textMsg)
  })

  const emailMsgs = pet.parents.reduce<EmailMsg[]>((previusValue, currentValue) => {
    const email = currentValue.email
    return (email ? (
      [...previusValue, {
        to: email!,
        from: process.env.EMAIL_FROM!,
        subject: "Lost child",
        name: "Pet Tag",
        text: `${pet.name} is at https://maps.google.com/?q=${latitude},${longitude}`,
      }]
    ) : (
      previusValue
    ))
  }, [])

  const resultsEmails = emailMsgs.map((msg) => {
    return emailClient.send(msg)
  })

  try {
    await Promise.all(resultsEmails)
    await Promise.all(resultsTextMsgs)
    res.json({ message: `Messages has been sent` })
  } catch(error) {
    console.dir(error)
    res.status(500).json({ error: "Error sending messages" })
  }
}
