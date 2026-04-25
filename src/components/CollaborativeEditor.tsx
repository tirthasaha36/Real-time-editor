import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { useEffect, useState, useMemo } from 'react'
import { 
  Bold as BoldIcon, Italic as ItalicIcon, Strikethrough, Code as CodeIcon, 
  Heading1, Heading2, List, ListOrdered, 
  Quote, Undo, Redo, Loader2
} from 'lucide-react'

const getRandomUser = () => {
  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah']
  const colors = ['#f783ac', '#da77f2', '#9775fa', '#748ffc', '#4dadf7', '#3bc9db', '#38d9a9', '#69db7c']
  const index = Math.floor(Math.random() * names.length)
  return {
    name: names[index],
    color: colors[index]
  }
}

interface User {
  name: string
  color: string
}

const Toolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null

  return (
    <div className="toolbar" style={{ 
      display: 'flex', 
      gap: '0.5rem', 
      padding: '0.75rem', 
      background: 'rgba(255,255,255,0.05)', 
      borderRadius: '8px',
      marginBottom: '1rem',
      border: '1px solid rgba(255,255,255,0.1)',
      flexWrap: 'wrap'
    }}>
      <button onClick={() => editor.chain().focus().toggleBold().run()} className="toolbar-btn"><BoldIcon size={18} /></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className="toolbar-btn"><ItalicIcon size={18} /></button>
      <button onClick={() => editor.chain().focus().toggleStrike().run()} className="toolbar-btn"><Strikethrough size={18} /></button>
      <button onClick={() => editor.chain().focus().toggleCode().run()} className="toolbar-btn"><CodeIcon size={18} /></button>
      <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className="toolbar-btn"><Heading1 size={18} /></button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className="toolbar-btn"><Heading2 size={18} /></button>
      <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className="toolbar-btn"><List size={18} /></button>
      <button onClick={() => editor.chain().focus().toggleOrderedList().run()} className="toolbar-btn"><ListOrdered size={18} /></button>
      <button onClick={() => editor.chain().focus().toggleBlockquote().run()} className="toolbar-btn"><Quote size={18} /></button>
      <div style={{ width: '1px', background: 'rgba(255,255,255,0.1)', margin: '0 0.5rem' }} />
      <button onClick={() => editor.chain().focus().undo().run()} className="toolbar-btn"><Undo size={18} /></button>
      <button onClick={() => editor.chain().focus().redo().run()} className="toolbar-btn"><Redo size={18} /></button>
    </div>
  )
}

interface EditorWrapperProps {
  ydoc: Y.Doc
  provider: WebsocketProvider
  currentUser: User
  users: User[]
}

const EditorWrapper = ({ ydoc, provider, currentUser, users }: EditorWrapperProps) => {
  const extensions = useMemo(() => [
    Collaboration.configure({
      document: ydoc,
    }),
    /* CollaborationCursor.configure({
      provider: provider,
      user: currentUser,
    } as any), */
    StarterKit.configure({
      history: false,
    } as any),
  ], [ydoc])

  const editor = useEditor({
    extensions,
    onCreate: () => console.log('[SyncEdit] Editor created!'),
  })

  if (!editor) return null

  return (
    <div className="app-container" style={{ padding: '2rem', color: 'white', background: '#0a0a0c', minHeight: '100vh' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.02em' }}>SyncEdit</h1>
          <div className="presence-list" style={{ display: 'flex', gap: '0.5rem' }}>
            {users.map((user, i) => (
              <div 
                key={`${user.name}-${i}`} 
                style={{ 
                  backgroundColor: user.color, 
                  width: '32px', 
                  height: '32px', 
                  borderRadius: '50%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  border: '2px solid rgba(255,255,255,0.1)'
                }}
                title={user.name}
              >
                {user.name ? user.name[0] : '?'}
              </div>
            ))}
          </div>
        </header>

        <Toolbar editor={editor} />

        <div className="editor-wrapper" style={{ 
          background: 'rgba(255,255,255,0.02)', 
          border: '1px solid rgba(255,255,255,0.08)', 
          borderRadius: '16px',
          padding: '2.5rem',
          minHeight: '400px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
          outline: 'none'
        }}>
          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}

export const CollaborativeEditor = () => {
  const [currentUser] = useState<User>(getRandomUser)
  const [users, setUsers] = useState<User[]>([])
  const [provider, setProvider] = useState<WebsocketProvider | null>(null)
  
  const ydoc = useMemo(() => new Y.Doc(), [])

  useEffect(() => {
    console.log('[SyncEdit] Initializing WebsocketProvider...')
    const p = new WebsocketProvider(
      'ws://localhost:1234',
      'tiptap-collaboration-demo',
      ydoc
    )

    p.awareness.setLocalStateField('user', {
      name: currentUser.name,
      color: currentUser.color,
    })

    p.awareness.on('change', () => {
      const states = Array.from(p.awareness.getStates().values()) as any[]
      const activeUsers = states
        .map(s => s.user)
        .filter((user): user is User => !!(user && user.name))
      setUsers(activeUsers)
    })

    setProvider(p)

    return () => {
      console.log('[SyncEdit] Cleaning up...')
      p.destroy()
      ydoc.destroy()
    }
  }, [ydoc, currentUser])

  if (!provider) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0a0a0c', color: 'white', height: '100vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="animate-spin" style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'white', borderRadius: '50%', margin: '0 auto 1rem' }} />
          <p style={{ opacity: 0.5 }}>Connecting to server...</p>
        </div>
      </div>
    )
  }

  return (
    <EditorWrapper 
      ydoc={ydoc} 
      provider={provider} 
      currentUser={currentUser} 
      users={users} 
    />
  )
}
