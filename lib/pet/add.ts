import prisma from "../prisma"
import { NextApiRequest, NextApiResponse } from "next"
import { unstable_getServerSession } from "next-auth"
import { authOptions } from "../../pages/api/auth/[...nextauth]"

export default async function (
  req: NextApiRequest,
  res: NextApiResponse
) {
  const session = await unstable_getServerSession(req, res, authOptions)
  if (!session) {
    return res.status(401).send({ message: "Unauthorized" })
  }

  const { name, password } = req.body
  const code = req.query.code as string

  const userOrNull = await prisma.user.findUnique({
    where: {
      email: session.user!.email!,
    },
  })
  const user = userOrNull!

  const pet = await prisma.pet.findUnique({
    select: {
      id: true,
    },
    where: {
      tagCode: code,
    },
  })
  if (pet) {
    return res.status(401).send({ message: "Tag has already been used" })
  }

  let tag = await prisma.tag.findUnique({
    select: {
      id: true,
    },
    where: {
      code: code,
    },
  })
  if (!tag) {
    const tagWithPassword = await prisma.tag.findUnique({
      select: {
        code: true,
      },
      where: {
        password: password,
      },
    })
    if (!tagWithPassword) {
      return res.status(401).send({ message: "Password incorrect" })
    }

    const pet = await prisma.pet.findUnique({
      select: {
        id: true,
      },
      where: {
        tagCode: tagWithPassword.code,
      },
    })
    if (pet) {
      return res.status(401).send({ message: "Tag has already been used" })
    }

    tag = await prisma.tag.update({
      where: {
        password: password,
      },
      data: {
        code: code,
      }
    })
  }

  const userPet = await prisma.pet.findUnique({
    where: {
      name_ownerId: {
        name: name,
        ownerId: user.id,
      },
    },
  })
  if (userPet) {
    return res.status(422).send({ message: "Name has already been used" })
  }

  const petCreated = await prisma.pet.create({
    data: {
      name: name,
      owner: {
        connect: { id: user.id },
      },
      tag: {
        connect: { id: tag.id },
      },
    },
  })
  res.status(200).json({name: petCreated.name})
}