import { useState } from "react"
import { useRouter } from "next/router"
import { Layout } from "../../components/layout"

const AddPet = () => {
  const [name, setName] = useState("")
  const router = useRouter()

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      const body = { name }
      await fetch(`/api/pets/${router.query.code}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      await router.push("/")
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <form
      onSubmit={submitData}
    >
      <input
        autoFocus
        onChange={(e) => setName(e.target.value)}
        placeholder="Name"
        type="text"
        value={name}
      />
      <button disabled={!name}>
        Edit pet
      </button>
    </form>
  )
}

AddPet.Layout = Layout

export default AddPet
