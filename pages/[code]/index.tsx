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
    phone: {
      number: string | null,
      public: boolean,
    } | null,
    email: {
      address: string | null,
      public: boolean,
    } | null,
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
      parents: {
        select: {
          name: true,
          email: {
            select: {
              address: true,
              public: true,
            }
          },
          phone: {
            select: {
              number: true,
              public: true,
            }
          },
        },
      },
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
  const isTheOwner = session?.user?.email === ownerEmail

  const parents = pet.parents.map(parent => ({
    name: parent.name,
    email: parent.email ? {
      address: isTheOwner || parent.email.public ?
        (parent.email?.address ?? null) : null,
      public: isTheOwner && parent.email.public
    } : null,
    phone: parent.phone ? {
      number: isTheOwner || parent.phone.public ?
        (parent.phone?.number ?? null) : null,
      public: isTheOwner && parent.phone.public
    } : null,
  }))

  return {
    props: {
      tag: {
        pet: {
          name: pet.name,
          parents,
          ownerEmail: ownerOrNull!.email!,
        },
      },
    },
  }
}

const Pet = ({ tag }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const session = useSession()
  const router = useRouter()

  const notify = () => {
    if (!navigator.geolocation) {
      console.log("there is no geolocation")
    } else {
      navigator.geolocation.getCurrentPosition(
        async (location) => {
          try {
            await fetch("/api/notify-parents", {
              "method": "POST",
              "headers": { "content-type": "application/json" },
              "body": JSON.stringify({
                code: router.query.code,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }),
            })
          } catch (error) {
            console.dir(error)
          }
        },
        () => console.log("could not get the location"),
      )
    }
  }

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
                const { name, email, phone } = parent 

                return (
                  <li
                    className="flex flex-row space-x-4"
                    key={name}
                  >
                    <span> {name} </span>
                    {email && (
                      <div>
                        <span> {email.address} </span>
                        {tag?.pet?.ownerEmail && tag?.pet?.ownerEmail === session.data?.user?.email && (
                          <span className="text-sm"> {`is ${email.public ? "public": "private"}`} </span>
                        )}
                      </div>
                    )}
                    {phone && (
                      <div>
                        <span> {phone.number} </span>
                        {tag?.pet?.ownerEmail && tag?.pet?.ownerEmail === session.data?.user?.email && (
                          <span className="text-sm"> {`is ${phone.public ? "public": "private"}`} </span>
                        )}
                      </div>
                    )}
                  </li>
                )
              })}
            </ul>
          </div>
          <button
            onClick={notify}
          >
            Notify parents
          </button>
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
