import prisma from "../../../../../lib/prisma"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const code = req.query.code as string
    const { password } = req.body

    const tag = await prisma.tag.findMany({
      select: {
        id: true,
      },
      where: {
        AND: [
          {
            code: code
          },
          {
            password: password
          },
        ],
      },
    })
    if (!tag.length) {
      return res.status(401).send({ message: "Password incorrect" })
    }

    const pet = await prisma.pet.findUnique({
      select: {
        owner: {
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

    res.status(200).json({email: pet.owner.email})
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    )
  }
}
