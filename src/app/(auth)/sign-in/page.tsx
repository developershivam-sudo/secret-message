'use client'

import { useSession, signIn, signOut } from "next-auth/react"

export default function Component() {
  const { data: session } = useSession()
  if (session) {
    return (
      <>
        Signed in as {session.user.email} <br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  return (
    <>
      <p>Not signed in</p>
      <button className="bg-orange-500 m-3 px-5 py-1 rounded" onClick={() => signIn()}>Sign in</button>
    </>
  )
}