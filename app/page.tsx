"use client"

import { useState, ChangeEvent, KeyboardEvent, useEffect } from "react"

interface NoteData {
  text: string;
  id: number;
  date: Date;
}

export default function () {
  const [notes, setNotes] = useState<NoteData[]>([])
  const [input, setInput] = useState("")

  const handleOnKeyDown = async (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      await addNote()
      setInput('')
    }
  }

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value)
  }

  const getInput = () => (
    <input className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border p-2 rounded w-full text-black mb-[10px]" placeholder="Add a new task" type="text" onChange={(e) => handleInput(e)} onKeyDown={handleOnKeyDown} value={input} />
  )

  const Note: React.FC<NoteData> = (props: NoteData) => {
    return <li className="flex justify-between items-center bg-white/60 border border-gray-200 rounded-xl p-3 shadow-sm hover:bg-white/80 transition mb-[10px]"
    ><span className="text-gray-800">{props.text}</span><button className="text-red-500 hover:text-red-700"><span onClick={() => handleDelete(props.id)}>x</span></button></li>
  }

  async function getNotes() {
    fetch("/api/notes", {
      method: 'GET'
    })
      .then(res => res.json())
      .then(res => {
        setNotes(res.notes)
      })
  }

  async function handleDelete(id: number) {
    await deleteNote(id)
  }

  async function deleteNote(id: number) {
    const res = await fetch(`/api/notes`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err)
    }
    await getNotes()
  }

  useEffect(() => {
    getNotes()
  }, [])

  async function addNote() {
    if (!input.trim()) return
    const res = await fetch("/api/notes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: input })
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(err)
    }
    setInput('')
    await getNotes()
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Todo List</h1>
        {getInput()}
        <ul>
          {notes.map(({ id, text, date }) => {
            return <div key={id}><Note text={text} id={id} date={date} /></div>
          })}
        </ul>
      </div>
    </main>
  )
}