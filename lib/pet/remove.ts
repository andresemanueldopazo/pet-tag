import prisma from "../prisma"
import { NextApiRequest, NextApiResponse } from "next"
import { unstable_getServerSession } from "next-auth"
import { authOptions } from "../../pages/api/auth/[...nextauth]"

export default async function (
  req: NextApiRequest,
  res: NextApiResponse
) {
  const code = req.query.code as string
  const { password } = req.body

  const tag = await prisma.tag.findUnique({
    where: {
      code: code
    }
  })
  if (!tag) {
    return res.status(404).send({ message: "Tag not found" })
  }

  const pet = await prisma.pet.findUnique({
    select: {
      id: true,
      owner: {
        select: {
          id: true,
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

  if (tag.password !== password) {
    const session = await unstable_getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).send({ message: "Unauthorized" })
    }
    
    const userLoggedIn = await prisma.user.findUnique({
      select: {
        id: true,
      },
      where: {
        email: session.user!.email!,
      },
    })

    const owner = await prisma.user.findUnique({
      select: {
        id: true,
      },
      where: {
        id: pet.owner.id
      },
    })

    if (owner!.id !== userLoggedIn!.id) {
      return res.status(401).send({ message: "Unauthorized" })
    }
  }

  const petDeleted = await prisma.pet.delete({
    select: {
      name: true,
    },
    where: { id: pet.id },
  })
  res.status(200).json({name: petDeleted.name})
}