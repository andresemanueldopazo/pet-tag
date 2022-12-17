import { authOptions } from '../pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from "next-auth/next"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import prisma from "../lib/prisma"
import { Pets } from '../components/pets'
import { Pet } from '@prisma/client'
import { Layout } from '../components/layout'

export const getServerSideProps: GetServerSideProps<{ pets: Pet[] }> = async (context) => {
  const session = await unstable_getServerSession(context.req, context.res, authOptions)
  if (!session) {
    return {
      props: {
        pets: [],
      },
    }
  }

  const userOrNull = await prisma.user.findUnique({
    where: {
      email: session.user!.email!,
    },
  })
  const user = userOrNull!

  const pets = await prisma.pet.findMany({
    where: {
      ownerId: user.id,
    },
  })

  return {
    props: {
      pets,
    },
  }
}

const Home = ({ pets }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  return (
    <>
      {!!pets.length && (
        <>
          Childrens
          <Pets
            pets={pets}
          />
        </>
      )}
    </>
  )
}

Home.Layout = Layout

export default Home
