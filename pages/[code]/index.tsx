import type { GetServerSideProps, InferGetServerSidePropsType } from "next"
import { Prisma } from "@prisma/client"
import prisma from "../../lib/prisma"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect, useState } from "react"
import Link from "next/link"
import * as AlertDialog from "@radix-ui/react-alert-dialog"
import { Layout } from "../../components/layout"

type PetInfo = {
  name: string,
  ownerEmail: string,
}

export const getServerSideProps: GetServerSideProps<{ petInfo: PetInfo | null }> = async ({ params }) => {
  if (!params?.code) {
    return {
      notFound: true,
    }
  }

  const tag = await prisma.tag.findUnique({
    where: {
      code: params.code as string,
    },
  })
  if (!tag) {
    return {
      notFound: true,
    }
  }

  const pet = await prisma.pet.findUnique({
    where: {
      tagCode: tag.code,
    },
  })
  if (!pet) {
    return {
      props: {
        petInfo: null,
      },
    }
  }

  const userEmail = Prisma.validator<Prisma.UserSelect>()({
    email: true,
  })
  const ownerOrNull = await prisma.user.findUnique({
    select: userEmail,
    where: {
      id: pet.ownerId,
    },
  })

  return {
    props: {
      petInfo: {
        name: pet.name,
        ownerEmail: ownerOrNull!.email!,
      },
    },
  }
}

const Pet = ({ petInfo }: InferGetServerSidePropsType<typeof getServerSideProps>) => {
  const session = useSession()
  const router = useRouter()

  useEffect(() => {
    if (session.status !== "loading" && !petInfo) {
      const url = `/${router.query.code}/add`
      if (session.status === "authenticated") {
        router.push(url)
      } else {
        signIn(undefined, { callbackUrl: url })
      }
    }
  }, [session])

  const [openDeleteAlert, setOpenDeleteAlert] = useState(false)

  const deletePet = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      await fetch(`/api/pets/${router.query.code}`, {
        method: "DELETE",
      })
      await router.push("/")
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <>
      {petInfo && (
        <div className="flex flex-col">
          <> { petInfo.name } </>
          {session.data?.user?.email === petInfo.ownerEmail && (
            <div className="space-x-4">
              <Link href={`/${router.query.code}/edit`}> Edit </Link>
              <AlertDialog.Root
                open={openDeleteAlert}
                onOpenChange={setOpenDeleteAlert}
              >
                <AlertDialog.Trigger>
                  Delete
                </AlertDialog.Trigger>
                <AlertDialog.Portal>
                  <AlertDialog.Overlay
                    className="
                      fixed inset-0 z-50 bg-black bg-opacity-40 flex items-center justify-center
                    "
                    onClick={() => setOpenDeleteAlert(false)}
                  />
                  <AlertDialog.Content className="
                    fixed z-50 top-1/2 left-1/2 -translate-y-1/2 -translate-x-1/2
                    w-max max-w-full flex flex-col items-center border rounded p-4 bg-primary
                  ">
                    <AlertDialog.Title>
                      Are you sure?
                    </AlertDialog.Title>
                    <div className="flex space-x-4">
                      <AlertDialog.Cancel>
                        Cancel
                      </AlertDialog.Cancel>
                      <AlertDialog.Action asChild>
                        <button onClick={(e) => deletePet(e)}>
                          Yes, delete profile pet
                        </button>
                      </AlertDialog.Action>
                    </div>
                  </AlertDialog.Content>
                </AlertDialog.Portal>
              </AlertDialog.Root>
            </div>
          )}
        </div>
      )}
    </>
  )
}

Pet.Layout = Layout

export default Pet
