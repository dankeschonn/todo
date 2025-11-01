"use client"

import { useState, ChangeEvent, KeyboardEvent, useEffect } from "react"

interface NoteData {
  string: string;
  id: number;
}

export default function () {
  const [notes, setNotes] = useState<string[]>([])
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

  const handleDelete = async (index: number) => {
    const temp = notes.filter((el, i) => index !== i)
    await deleteNote(index)
  }

  const getInput = () => (
    <input className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border p-2 rounded w-full text-black mb-[10px]" placeholder="Add a new task" type="text" onChange={handleInput} onKeyDown={handleOnKeyDown} value={input} />
  )

  const Note: React.FC<NoteData> = (props: NoteData) => {
    return <li className="flex justify-between items-center bg-white/60 border border-gray-200 rounded-xl p-3 shadow-sm hover:bg-white/80 transition mb-[10px]"
    ><span className="text-gray-800">{props.string}</span><button className="text-red-500 hover:text-red-700" onClick={() => handleDelete(props.id)}><span>x</span></button></li>
  }

  useEffect(() => {
    fetch("/api/notes")
      .then(res => res.json())
      .then(el => setNotes(el.notes))
  }, [])

  async function deleteNote(index: number) {
    let temp = notes.slice().filter((_, i) => index !== i)
    const res = await fetch('/api/notes', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ newNotes: temp })
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(err)
    }
    const newNotes: { success: boolean, notes: string[] } = await res.json()
    setNotes(newNotes.notes.slice())
  }

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
    const newNote = await res.json()
    setNotes([...newNote.notes.slice()])
    setInput('')
  }

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-8">
      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">Todo List</h1>
        {getInput()}
        <ul>
          {notes.map((datum, index) => {
            return <div key={index}><Note string={datum} id={index} /></div>
          })}
        </ul>
      </div>
    </main>
  )
}