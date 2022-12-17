import type { GetServerSideProps, InferGetServerSidePropsType } from "next"
import prisma from "../../lib/prisma"
import { useSession, signIn } from "next-auth/react"
import { useRouter } from "next/router"
import { useEffect } from "react"
import Link from "next/link"

type PetInfo = {
  name: string,
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

  const petInfo = {
    name: pet.name,
  }

  return {
    props: {
      petInfo,
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

  return (
    <>
      {petInfo && (
        <div className="flex flex-col">
          <> { petInfo.name } </>
          {session.status === "authenticated" && (
            <Link href={`/${router.query.code}/edit`}> Edit perfil</Link>
          )}
        </div>
      )}
    </>
  )
}

export default Pet
