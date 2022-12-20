import { FC } from "react"
import Link from "next/link"

type Pet = {
  name: string,
  tagCode: string,
}

export const Pets: FC<{pets: Pet[]}> = ({ pets }) => (
  <ul>
    {pets.map(pet => 
      <li key={pet.name}>
        {pet.name}
        <Link href={`/${pet.tagCode}`}> View perfil</Link>
      </li>
    )}
  </ul>
)

export default Pets
