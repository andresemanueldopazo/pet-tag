import { FC } from "react"
import Link from "next/link"

type Pet = {
  name: string,
  code: string,
}

export const Pets: FC<{pets: Pet[]}> = ({ pets }) => (
  <ul>
    {pets.map(pet => 
      <li key={pet.name}>
        {pet.name}
        <Link href={`/${pet.code}`}> View perfil</Link>
      </li>
    )}
  </ul>
)

export default Pets
