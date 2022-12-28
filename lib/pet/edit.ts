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
}
