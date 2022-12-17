import { useState } from "react"
import { useRouter } from "next/router"
import { Layout } from "../../components/layout"

const AddPet = () => {
  const [name, setName] = useState("")
  const [password, setTagPassword] = useState("")
  const router = useRouter()

  const submitData = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    try {
      const body = { name, password }
      await fetch(`/api/pets/${router.query.code}`, {
        method: "POST",
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
      <input
        autoFocus
        onChange={(e) => setTagPassword(e.target.value)}
        placeholder="Password"
        type="password"
        value={password}
      />
      <button disabled={!name || !password}>
        Add pet
      </button>
    </form>
  )
}

AddPet.Layout = Layout

export default AddPet
