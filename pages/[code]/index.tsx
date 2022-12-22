import type { GetServerSideProps, InferGetServerSidePropsType } from "next"
import prisma from "../../lib/prisma"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"
import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { Layout } from "../../components/layout"
import DesassociatePet from "../../components/disassociate-pet"
import RememberEmail from "../../components/remember-email"
import { DeletePet } from "../../components/delete-pet"

type Tag = {
  pet: Pet | null,
}

type Pet = {
  name: string,
  ownerEmail: string,
}

export const getServerSideProps: GetServerSideProps<{ tag: Tag | null }> = async ({ params }) => {
  if (!params?.code) {
    return {
      notFound: true,
    }
  }

  const tagCode = params.code as string

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

  const ownerOrNull = await prisma.user.findUnique({
    select: {
      email: true
    },
    where: {
      id: pet.ownerId,
    },
  })

  return {
    props: {
      tag: {
        pet: {
          name: pet.name,
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
