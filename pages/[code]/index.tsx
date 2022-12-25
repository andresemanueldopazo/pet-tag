import type { GetServerSideProps, InferGetServerSidePropsType } from "next"
import prisma from "../../lib/prisma"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"
import { Layout } from "../../components/layout"
import DesassociatePet from "../../components/disassociate-pet"
import RememberEmail from "../../components/remember-email"
import { DeletePet } from "../../components/delete-pet"
import { authOptions } from "../api/auth/[...nextauth]"
import { unstable_getServerSession } from "next-auth"

type Tag = {
  pet: Pet | null,
}

type Pet = {
  name: string,
  parents: {
    name: string,
    email: string | null,
    phoneNumber: string | null,
    visible: boolean,
  }[],
  ownerEmail: string,
}

export const getServerSideProps: GetServerSideProps<{ tag: Tag | null }> = async (context) => {
  if (!context.params?.code) {
    return {
      notFound: true,
    }
  }

  const tagCode = context.params.code as string

  const tag = await prisma.tag.findUnique({
    where: {
      code: tagCode,
    },
  })
  if (!tag) {
    return {
      props: {
        tag: null,
      },
    }
  }
  const pet = await prisma.pet.findUnique({
    select: {
      name: true,
      parents: true,
      ownerId: true,
    },
    where: {
      tagCode: tagCode,
    },
  })
  if (!pet) {
    return {
      props: {
        tag: {
          pet: null,
        },
      },
    }
  }

  const parents = pet.parents.map(parent => ({
    name: parent.name,
    email: parent.email,
    phoneNumber: parent.phoneNumber,
    visible: parent.visible,
  }))

  const ownerOrNull = await prisma.user.findUnique({
    select: {
      email: true
    },
    where: {
      id: pet.ownerId,
    },
  })
  const ownerEmail = ownerOrNull!.email!

  const session = await unstable_getServerSession(context.req, context.res, authOptions)
  
  return {
    props: {
      tag: {
        pet: {
          name: pet.name,
          parents: session?.user?.email === ownerEmail ? (
            parents
          ) : (
            parents.filter(parent => parent.visible)
          ),
          ownerEmail: ownerOrNull!.email!,
        },
      },
    },
  }
}

const Pet = ({ tag }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session.status !== "loading" && !tag?.pet) {
      const url = `/${router.query.code}/add?exist=${!!tag}`
      if (session.status === "authenticated") {
        router.push(url)
      } else {
        signIn(undefined, { callbackUrl: url })
      }
    }
  }, [session])

  return (
    <>
      {tag?.pet && (
        <div className="flex flex-col space-y-4">
          <div>
            { tag.pet.name }
          </div>
          <div>
            <ul>
              {tag.pet.parents.map((parent) => {
                const { name, email, phoneNumber } = parent 
                return (
                  <li key={name}>
                    {name} {email} {phoneNumber}
                  </li>
                )
              })}
            </ul>
          </div>
          {session.data?.user?.email === tag.pet.ownerEmail ? (
            <div className="space-x-4">
              <Link href={`/${router.query.code}/edit`}> Edit </Link>
              <DeletePet/>
            </div>
          ) : (
            <div className="flex flex-col justify-center space-y-4">
              {!session.data && (
                <button
                  type="button"
                  onClick={() => signIn()}
                >
                  Log in to edit this profile
                </button>
              )}
              <RememberEmail/>
              <DesassociatePet/>
            </div>
          )}
        </div>
      )}
    </>
  )
}

Pet.Layout = Layout

export default Pet
