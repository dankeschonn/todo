"use client"

import { useState, KeyboardEvent, useEffect, } from "react"
import Pusher from "pusher-js"

interface NoteData {
  text: string;
  id: number;
  date: Date;
}

export default function () {
  const [notes, setNotes] = useState<NoteData[]>([])
  const [input, setInput] = useState("")
  const [showEdit, setShowEdit] = useState(false)
  const [editId, setEditId] = useState<number>()
  const [editInput, setEditInput] = useState("")
  const [isEdit, setIsEdit] = useState(false)

  const handleEditClick = (id: number, text: string) => {
    if (!showEdit) {
      setEditInput(text)
    }
    setShowEdit(!showEdit)
    setEditId(id)
    setIsEdit(!isEdit)
  }

  const handleEditKeyDown = async (e: KeyboardEvent) => {
    if (e.key === 'Enter' && editId != null) {
      await editNote(editId, editInput)
      setEditInput('')
      setIsEdit(false)
    } else if (e.key === 'Escape') {
      setIsEdit(false)
    }
  }

  const handleOnKeyDown = async (e: KeyboardEvent) => {
    if (e.key === 'Enter') {
      await addNote()
      setInput('')
    }
  }


  const getEditInput = () => {
    return <input key="editinput" className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border p-2 rounded w-full text-black mb-[10px]" placeholder={`Edit task`} type="text" value={editInput} onChange={(e) => setEditInput(e.target.value)} onKeyDown={handleEditKeyDown} />
  }

  const getInput = () => {
    return <input key="input" className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 border p-2 rounded w-full text-black mb-[10px]" placeholder={`Add new task`} type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={handleOnKeyDown} />
  }

  const Note = (props: NoteData) => {
    const isCurrentEdit = isEdit && props.id === editId
    return <li className="flex justify-between items-center bg-white/60 border border-gray-200 rounded-xl p-3 shadow-sm hover:bg-white/80 transition mb-[10px]"
    ><span className="text-gray-800">{isCurrentEdit ?
      getEditInput()
      : props.text}</span>
      <span>
        <button style={{ color: 'black', marginRight: '10px' }} onClick={() => handleEditClick(props.id, props.text)}
        >
          {isCurrentEdit ? 'back' : 'edit'}
        </button>
        <button className="text-red-500 hover:text-red-700">
          <span onClick={() => handleDelete(props.id)}>{isCurrentEdit ? '' : 'x'}</span>
        </button>
      </span>
    </li>
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

  async function editNote(id: number, text: string) {
    const res = await fetch('/api/notes', {
      method: "PATCH",
      headers: { "Content-Type": 'application/json' },
      body: JSON.stringify({ id, text })
    })
    if (!res.ok) {
      const err = await res.text()
      throw new Error(err)
    }
    await getNotes()
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
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    })
    const channel = pusher.subscribe("notes-channel")
    channel.bind("note-event", async (data: { action: string, msg: string }) => {
      await getNotes()
    })
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
          {notes.sort((a, b) => a.id - b.id).map(({ id, text, date }) => {
            return <div key={id}>{Note({ text: text, id, date })}</div>
          })}
        </ul>
      </div>
    </main>
  )
}