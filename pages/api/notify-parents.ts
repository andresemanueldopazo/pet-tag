import client from '@sendgrid/mail'
import { NextApiRequest, NextApiResponse } from 'next'
import prisma from "../../lib/prisma"

client.setApiKey(process.env.EMAIL_SERVER_PASSWORD!)

export default async (req: NextApiRequest, res: NextApiResponse) => {
  const { code, latitude, longitude } = req.body
  const pet = await prisma.pet.findUnique({
    select: {
      name: true,
      parents: {
        select: {
          email: true,
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

  const msgs = pet.parents.map((parent) => ({
    to: parent.email!,
    from: process.env.EMAIL_FROM!,
    subject: "Lost child",
    name: "Pet Tag",
    text: `${pet.name} is at https://maps.google.com/?q=${latitude},${longitude}`,
  }))

  const results = msgs.map((msg) => {
    return client.send(msg)
  })

  try {
    await Promise.all(results)
    res.json({ message: `Email has been sent` })
  } catch(error) {
    console.dir(error)
    res.status(500).json({ error: 'Error sending email' })
  }
}
