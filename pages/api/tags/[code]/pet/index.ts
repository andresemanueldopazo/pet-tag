import prisma from "../../../../../lib/prisma"
import { NextApiRequest, NextApiResponse } from "next"
import { unstable_getServerSession } from "next-auth"
import { authOptions } from "../../../auth/[...nextauth]"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
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
  } else if (req.method === "PUT") {
    const session = await unstable_getServerSession(req, res, authOptions)
    if (!session) {
      return res.status(401).send({ message: "Unauthorized" })
    }

    const { name } = req.body
    const code = req.query.code as string

    const pet = await prisma.pet.findUnique({
      select: {
        id: true,
        ownerId: true,
      },
      where: {
        tagCode: code
      },
    })
    if (!pet) {
      return res.status(401).send({ message: "Pet not found" })
    }

    const userLoggedInOrNull = await prisma.user.findUnique({
      where: {
        email: session.user!.email!,
      },
    })
    const userLoggedIn = userLoggedInOrNull!

    const nameWasUsed = await prisma.pet.findUnique({
      select: {
        id: true,
      },
      where: {
        name_ownerId: {
          name: name,
          ownerId: userLoggedIn.id,
        },
      },
    }) 
    if (nameWasUsed) {
      return res.status(422).send({ message: "Name has already been used" })
    }

    const owner = await prisma.user.findUnique({
      where: {
        id: pet.ownerId
      },
    })
    if (owner?.id !== userLoggedIn.id) {
      return res.status(401).send({ message: "Unauthorized" })
    }

    const petEdited = await prisma.pet.update({
      where: { id: pet.id },
      data: { name: name },
    })
    res.status(200).json({name: petEdited.name})
  } else if (req.method === "DELETE") {
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
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    )
  }
}
