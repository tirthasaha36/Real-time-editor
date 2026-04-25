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
    <div className="toolbar">
      <button 
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={`toolbar-btn ${editor.isActive('bold') ? 'is-active' : ''}`}
      >
        <BoldIcon size={18} />
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={`toolbar-btn ${editor.isActive('italic') ? 'is-active' : ''}`}
      >
        <ItalicIcon size={18} />
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleStrike().run()}
        className={`toolbar-btn ${editor.isActive('strike') ? 'is-active' : ''}`}
      >
        <Strikethrough size={18} />
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleCode().run()}
        className={`toolbar-btn ${editor.isActive('code') ? 'is-active' : ''}`}
      >
        <CodeIcon size={18} />
      </button>

      <div className="toolbar-divider" />

      <button 
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}`}
      >
        <Heading1 size={18} />
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}`}
      >
        <Heading2 size={18} />
      </button>

      <div className="toolbar-divider" />

      <button 
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        className={`toolbar-btn ${editor.isActive('bulletList') ? 'is-active' : ''}`}
      >
        <List size={18} />
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        className={`toolbar-btn ${editor.isActive('orderedList') ? 'is-active' : ''}`}
      >
        <ListOrdered size={18} />
      </button>
      <button 
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        className={`toolbar-btn ${editor.isActive('blockquote') ? 'is-active' : ''}`}
      >
        <Quote size={18} />
      </button>

      <div className="toolbar-divider" />

      <button 
        onClick={() => editor.chain().focus().undo().run()}
        className="toolbar-btn"
      >
        <Undo size={18} />
      </button>
      <button 
        onClick={() => editor.chain().focus().redo().run()}
        className="toolbar-btn"
      >
        <Redo size={18} />
      </button>
    </div>
  )
}

export const CollaborativeEditor = () => {
  const [currentUser] = useState<User>(getRandomUser)
  const [users, setUsers] = useState<User[]>([])
  const [provider, setProvider] = useState<WebsocketProvider | null>(null)
  
  const ydoc = useMemo(() => new Y.Doc(), [])

  useEffect(() => {
    console.log('[SyncEdit] Hook: Initializing WebsocketProvider...')
    try {
      const p = new WebsocketProvider(
        'ws://localhost:1234',
        'tiptap-collaboration-demo',
        ydoc
      )

      p.on('status', (event: { status: string }) => {
        console.log('[SyncEdit] Websocket status:', event.status)
      })

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
        console.log('[SyncEdit] Hook: Cleaning up...')
        p.destroy()
        ydoc.destroy()
      }
    } catch (err) {
      console.error('[SyncEdit] Error in useEffect:', err)
    }
  }, [ydoc, currentUser])

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        history: false,
      }) as any,
      Collaboration.configure({
        document: ydoc,
      }),
      provider ? CollaborationCursor.configure({
        provider: provider,
        user: {
          name: currentUser.name,
          color: currentUser.color,
        },
      }) : null,
    ].filter(Boolean) as any,
    onBeforeCreate: () => console.log('[SyncEdit] Editor about to be created...'),
    onCreate: () => console.log('[SyncEdit] Editor created!'),
    onUpdate: () => console.log('[SyncEdit] Editor update'),
  }, [provider])

  console.log('[SyncEdit] Render: editor=', !!editor, 'provider=', !!provider)

  return (
    <div className="app-container" style={{ padding: '2rem', color: 'white' }}>
      <h1>SyncEdit Debug Mode</h1>
      {!provider && <p>Waiting for provider...</p>}
      {provider && !editor && <p>Waiting for editor...</p>}
      {editor && (
        <>
          <div className="presence-list" style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
            {users.map((user, i) => (
              <div key={i} style={{ backgroundColor: user.color, padding: '0.25rem 0.5rem', borderRadius: '4px' }}>
                {user.name}
              </div>
            ))}
          </div>
          <div className="editor-wrapper" style={{ border: '1px solid #333', padding: '1rem' }}>
            <EditorContent editor={editor} />
          </div>
        </>
      )}
    </div>
  )
}
