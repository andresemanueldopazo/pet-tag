import { NextApiRequest, NextApiResponse } from "next"
import edit from "../../../../../lib/pet/edit"
import add from "../../../../../lib/pet/add"
import remove from "../../../../../lib/pet/remove"

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") {
    add(req, res)
  } else if (req.method === "PUT") {
    edit(req, res)
  } else if (req.method === "DELETE") {
    remove(req, res)
  } else {
    throw new Error(
      `The HTTP ${req.method} method is not supported at this route.`
    )
  }
}
