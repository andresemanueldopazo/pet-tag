import prisma from "../../../../lib/prisma"
import { NextApiRequest, NextApiResponse } from "next"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    const code = req.query.code as string
    const { password } = req.body

    const pet = await prisma.pet.findUnique({
      select: {
        tagPassword: true,
        owner: {
          select: {
            email: true,
          },
        },
      },
      where: {
        code: code,
      },
    })
    if (pet?.tagPassword !== password) {
      return res.status(401).send({ message: "Unauthorized" })
    }

    res.status(200).json({email: pet?.owner.email})
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    )
  }
}
