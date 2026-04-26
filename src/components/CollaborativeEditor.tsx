import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu as BubbleMenuComponent } from '@tiptap/react/menus'
import StarterKit from '@tiptap/starter-kit'
import Collaboration from '@tiptap/extension-collaboration'
import CollaborationCursor from '@tiptap/extension-collaboration-cursor'
import Placeholder from '@tiptap/extension-placeholder'
import BubbleMenuExtension from '@tiptap/extension-bubble-menu'
import * as Y from 'yjs'
import { WebsocketProvider } from 'y-websocket'
import { useEffect, useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bold as BoldIcon, Italic as ItalicIcon, Strikethrough, Code as CodeIcon, 
  Heading1, Heading2, List, ListOrdered, 
  Quote, Undo, Redo, FileText, Settings, Users, 
  Share2, MessageSquare, Clock, ChevronDown, MoreHorizontal
} from 'lucide-react'

const getRandomUser = () => {
  const names = ['Alice', 'Bob', 'Charlie', 'Diana', 'Edward', 'Fiona', 'George', 'Hannah']
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316']
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

const Sidebar = () => {
  const items = [
    { icon: <FileText size={18} />, label: 'Main Document' },
    { icon: <MessageSquare size={18} />, label: 'Discussions' },
    { icon: <Users size={18} />, label: 'Team Space' },
    { icon: <Clock size={18} />, label: 'Version History' },
  ]

  return (
    <aside className="sidebar">
      <div style={{ marginBottom: '2.5rem', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#fff' }}>
          <div style={{ width: '28px', height: '28px', background: 'var(--accent)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileText size={16} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.02em' }}>SyncEdit</span>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem', paddingLeft: '0.5rem' }}>Workspace</span>
        {items.map((item, i) => (
          <button key={i} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.75rem', 
            padding: '0.6rem 0.75rem', 
            background: i === 0 ? 'var(--accent-soft)' : 'transparent',
            border: 'none',
            color: i === 0 ? 'var(--accent)' : 'var(--text-muted)',
            borderRadius: '8px',
            cursor: 'pointer',
            textAlign: 'left',
            fontSize: '0.9rem',
            fontWeight: i === 0 ? 600 : 400
          }}>
            {item.icon}
            {item.label}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.6rem 0.75rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
          <Settings size={18} />
          Settings
        </button>
      </div>
    </aside>
  )
}

const EditorHeader = ({ users, status }: { users: User[], status: string }) => {
  return (
    <div className="toolbar-container">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          <span>Workspace</span>
          <ChevronDown size={14} />
          <span>/</span>
          <span style={{ color: '#fff', fontWeight: 500 }}>Technical Specification</span>
        </div>
        <div className="status-pill">
          <div className={`pulse-dot ${status !== 'connected' ? 'offline' : ''}`} style={{ background: status === 'connected' ? '#10b981' : '#ef4444' }} />
          {status === 'connected' ? 'Synced' : 'Connecting...'}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        <div className="avatar-stack">
          <AnimatePresence>
            {users.map((user, i) => (
              <motion.div 
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                key={`${user.name}-${i}`} 
                className="avatar-pill" 
                style={{ backgroundColor: user.color, zIndex: users.length - i }}
                title={user.name}
              >
                {user.name[0]}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        <button style={{ 
          background: 'var(--accent)', 
          color: 'white', 
          border: 'none', 
          padding: '0.5rem 1rem', 
          borderRadius: '6px', 
          fontSize: '0.85rem', 
          fontWeight: 600, 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          cursor: 'pointer'
        }}>
          <Share2 size={16} />
          Share
        </button>
        <button style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <MoreHorizontal size={20} />
        </button>
      </div>
    </div>
  )
}

const FloatingToolbar = ({ editor }: { editor: any }) => {
  if (!editor) return null

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '2rem', 
      left: '50%', 
      transform: 'translateX(-50%)', 
      background: 'rgba(24, 24, 27, 0.8)', 
      backdropFilter: 'blur(16px)',
      border: '1px solid var(--border-strong)',
      borderRadius: '12px',
      padding: '0.5rem',
      display: 'flex',
      gap: '0.25rem',
      boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
      zIndex: 100
    }}>
      <button onClick={() => editor.chain().focus().toggleBold().run()} className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}><BoldIcon size={18} /></button>
      <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}><ItalicIcon size={18} /></button>
      <div style={{ width: '1px', background: 'var(--border-subtle)', margin: '0 0.25rem' }} />
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}><Heading1 size={18} /></button>
      <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}><Heading2 size={18} /></button>
      <div style={{ width: '1px', background: 'var(--border-subtle)', margin: '0 0.25rem' }} />
      <button onClick={() => editor.chain().focus().toggleBulletList().run()} className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}><List size={18} /></button>
      <div style={{ width: '1px', background: 'var(--border-subtle)', margin: '0 0.25rem' }} />
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
  status: string
}

const EditorWrapper = ({ ydoc, provider, currentUser, users, status }: EditorWrapperProps) => {
  const extensions = useMemo(() => [
    StarterKit.configure({
      history: false,
    } as any),
    Collaboration.configure({
      document: ydoc,
    }),
    /* CollaborationCursor.configure({
      provider: provider,
      user: currentUser,
    } as any), */
    Placeholder.configure({
      placeholder: 'Untitled Document',
    }),
    BubbleMenuExtension.configure(),
  ], [ydoc])

  const editor = useEditor({
    extensions,
    immediatelyRender: false,
    onCreate: () => console.log('[SyncEdit] Editor created!'),
  })

  if (!editor) return null

  return (
    <div className="workspace">
      <Sidebar />
      <main className="main-content">
        <EditorHeader users={users} status={status} />
        
        <div style={{ position: 'relative' }}>
          {editor && (
            <BubbleMenuComponent editor={editor} {...{ tippyOptions: { duration: 100 } } as any}>
              <div className="bubble-menu">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className="toolbar-btn"><BoldIcon size={14} /></button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className="toolbar-btn"><ItalicIcon size={14} /></button>
                <button onClick={() => editor.chain().focus().toggleCode().run()} className="toolbar-btn"><CodeIcon size={14} /></button>
              </div>
            </BubbleMenuComponent>
          )}
          
          <EditorContent editor={editor} />
        </div>

        <FloatingToolbar editor={editor} />
      </main>
    </div>
  )
}

export const CollaborativeEditor = () => {
  const [currentUser] = useState<User>(getRandomUser)
  const [users, setUsers] = useState<User[]>([])
  const [provider, setProvider] = useState<WebsocketProvider | null>(null)
  const [status, setStatus] = useState('connecting')
  
  const ydoc = useMemo(() => new Y.Doc(), [])

  useEffect(() => {
    console.log('[SyncEdit] Initializing WebsocketProvider...')
    const p = new WebsocketProvider(
      'ws://localhost:1234',
      'tiptap-collaboration-demo',
      ydoc
    )

    p.on('status', (event: { status: string }) => {
      setStatus(event.status)
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
      console.log('[SyncEdit] Cleaning up...')
      p.destroy()
      ydoc.destroy()
    }
  }, [ydoc, currentUser])

  if (!provider) return null

  return (
    <EditorWrapper 
      ydoc={ydoc} 
      provider={provider} 
      currentUser={currentUser} 
      users={users} 
      status={status}
    />
  )
}
