import { useEditor, EditorContent } from '@tiptap/react'
import Document from '@tiptap/extension-document'
import Paragraph from '@tiptap/extension-paragraph'
import Text from '@tiptap/extension-text'
import Bold from '@tiptap/extension-bold'
import Italic from '@tiptap/extension-italic'
import Strike from '@tiptap/extension-strike'
import Code from '@tiptap/extension-code'
import Heading from '@tiptap/extension-heading'
import BulletList from '@tiptap/extension-bullet-list'
import OrderedList from '@tiptap/extension-ordered-list'
import ListItem from '@tiptap/extension-list-item'
import Blockquote from '@tiptap/extension-blockquote'
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
  const [currentUser] = useState(getRandomUser)
  const [users, setUsers] = useState<any[]>([])
  const [provider, setProvider] = useState<WebsocketProvider | null>(null)
  
  const ydoc = useMemo(() => new Y.Doc(), [])

  useEffect(() => {
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
      setUsers(Array.from(p.awareness.getStates().values()).map((s: any) => s.user).filter(Boolean))
    })

    setProvider(p)

    return () => {
      p.destroy()
      ydoc.destroy()
    }
  }, [ydoc, currentUser])

  const editor = useEditor({
    extensions: [
      Document,
      Paragraph,
      Text,
      Bold,
      Italic,
      Strike,
      Code,
      Heading.configure({ levels: [1, 2, 3] }),
      BulletList,
      OrderedList,
      ListItem,
      Blockquote,
      Collaboration.configure({
        document: ydoc,
      }),
      provider ? CollaborationCursor.configure({
        provider: provider,
        user: currentUser,
      }) : null,
    ].filter(Boolean) as any,
  }, [provider])

  if (!editor || !provider) {
    return (
      <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loader2 className="animate-spin" size={48} color="rgba(255,255,255,0.2)" />
      </div>
    )
  }

  return (
    <div className="app-container">
      <header className="header">
        <div className="title-section">
          <h1>SyncEdit</h1>
        </div>
        <div className="presence-list">
          {users.map((user, i) => (
            <div 
              key={i} 
              className="avatar" 
              style={{ backgroundColor: user.color }}
              title={user.name}
            >
              {user.name[0]}
            </div>
          ))}
        </div>
      </header>

      <Toolbar editor={editor} />

      <div className="editor-wrapper">
        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
