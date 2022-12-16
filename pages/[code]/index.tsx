import type { GetServerSideProps, InferGetServerSidePropsType } from "next"
import prisma from "../../lib/prisma"

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
  return (
    <>
      {petInfo ? (
        <> { petInfo.name } </>
      ) : (
        <> The tag was not assigned </>
      )}
    </>
  )
}

export default Pet
