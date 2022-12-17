import Head from 'next/head'
import Image from 'next/image'
import { authOptions } from '../pages/api/auth/[...nextauth]'
import { unstable_getServerSession } from "next-auth/next"
import { GetServerSideProps, InferGetServerSidePropsType } from "next"
import prisma from "../lib/prisma"
import { Pets } from '../components/pets'
import Component from "../components/login-button"
import { Pet } from '@prisma/client'

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
    <div className="flex min-h-screen flex-col items-center justify-center py-2">
      <Head>
        <title>Pet tag</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="flex w-full flex-1 flex-col items-center justify-center px-20 text-center">
        <Component/>
        {!!pets.length && (
          <>
            Childrens
            <Pets
              pets={pets}
            />
          </>
        )}
      </main>

      <footer className="flex h-24 w-full items-center justify-center border-t">
        <a
          className="flex items-center justify-center gap-2"
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{' '}
          <Image src="/vercel.svg" alt="Vercel Logo" width={72} height={16} />
        </a>
      </footer>
    </div>
  )
}

export default Home
