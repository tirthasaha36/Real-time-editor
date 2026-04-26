import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
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
  Quote, Undo, Redo, Loader2, Wifi, WifiOff
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
      gap: '0.25rem', 
      padding: '0.5rem', 
      background: 'rgba(255,255,255,0.03)', 
      borderRadius: '12px',
      marginBottom: '1.5rem',
      border: '1px solid rgba(255,255,255,0.08)',
      flexWrap: 'wrap',
      backdropFilter: 'blur(10px)'
    }}>
      <div className="toolbar-group" style={{ display: 'flex', gap: '0.25rem' }}>
        <button 
          onClick={() => editor.chain().focus().toggleBold().run()} 
          className={`toolbar-btn ${editor.isActive('bold') ? 'active' : ''}`}
          title="Bold"
        ><BoldIcon size={18} /></button>
        <button 
          onClick={() => editor.chain().focus().toggleItalic().run()} 
          className={`toolbar-btn ${editor.isActive('italic') ? 'active' : ''}`}
          title="Italic"
        ><ItalicIcon size={18} /></button>
        <button 
          onClick={() => editor.chain().focus().toggleStrike().run()} 
          className={`toolbar-btn ${editor.isActive('strike') ? 'active' : ''}`}
          title="Strike"
        ><Strikethrough size={18} /></button>
      </div>

      <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 0.5rem' }} />

      <div className="toolbar-group" style={{ display: 'flex', gap: '0.25rem' }}>
        <button 
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} 
          className={`toolbar-btn ${editor.isActive('heading', { level: 1 }) ? 'active' : ''}`}
          title="Heading 1"
        ><Heading1 size={18} /></button>
        <button 
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} 
          className={`toolbar-btn ${editor.isActive('heading', { level: 2 }) ? 'active' : ''}`}
          title="Heading 2"
        ><Heading2 size={18} /></button>
      </div>

      <div style={{ width: '1px', background: 'rgba(255,255,255,0.08)', margin: '0 0.5rem' }} />

      <div className="toolbar-group" style={{ display: 'flex', gap: '0.25rem' }}>
        <button 
          onClick={() => editor.chain().focus().toggleBulletList().run()} 
          className={`toolbar-btn ${editor.isActive('bulletList') ? 'active' : ''}`}
          title="Bullet List"
        ><List size={18} /></button>
        <button 
          onClick={() => editor.chain().focus().toggleOrderedList().run()} 
          className={`toolbar-btn ${editor.isActive('orderedList') ? 'active' : ''}`}
          title="Ordered List"
        ><ListOrdered size={18} /></button>
      </div>

      <div style={{ flex: 1 }} />

      <div className="toolbar-group" style={{ display: 'flex', gap: '0.25rem' }}>
        <button onClick={() => editor.chain().focus().undo().run()} className="toolbar-btn" title="Undo"><Undo size={18} /></button>
        <button onClick={() => editor.chain().focus().redo().run()} className="toolbar-btn" title="Redo"><Redo size={18} /></button>
      </div>
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
    Placeholder.configure({
      placeholder: 'Write something together...',
    }),
    BubbleMenuExtension.configure(),
  ], [ydoc])

  const editor = useEditor({
    extensions,
    onCreate: () => console.log('[SyncEdit] Editor created!'),
  })

  if (!editor) return null

  return (
    <div className="app-container" style={{ 
      padding: '2rem', 
      color: 'white', 
      background: '#0a0a0c', 
      minHeight: '100vh',
      fontFamily: "'Inter', sans-serif"
    }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          marginBottom: '3rem',
          padding: '0 1rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h1 style={{ 
              margin: 0, 
              fontSize: '1.75rem', 
              fontWeight: 800, 
              letterSpacing: '-0.04em',
              background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.5) 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent'
            }}>SyncEdit</h1>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.5rem', 
              padding: '0.25rem 0.75rem', 
              background: 'rgba(255,255,255,0.03)', 
              borderRadius: '20px',
              border: '1px solid rgba(255,255,255,0.08)',
              fontSize: '0.75rem',
              color: 'rgba(255,255,255,0.4)'
            }}>
              <div style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                background: status === 'connected' ? '#10b981' : '#ef4444',
                boxShadow: status === 'connected' ? '0 0 10px #10b981' : 'none'
              }} />
              {status === 'connected' ? 'Live Syncing' : 'Connecting...'}
            </div>
          </div>

          <div className="presence-list" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.3)', marginRight: '0.5rem' }}>Editing now:</span>
            <div style={{ display: 'flex', marginLeft: '0.5rem' }}>
              <AnimatePresence>
                {users.map((user, i) => (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5, x: -10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.5, x: -10 }}
                    key={`${user.name}-${i}`} 
                    style={{ 
                      backgroundColor: user.color, 
                      width: '36px', 
                      height: '36px', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      border: '3px solid #0a0a0c',
                      marginLeft: i === 0 ? 0 : '-12px',
                      zIndex: users.length - i,
                      boxShadow: '0 4px 12px rgba(0,0,0,0.5)'
                    }}
                    title={user.name}
                  >
                    {user.name ? user.name[0] : '?'}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <Toolbar editor={editor} />

        {editor && (
          <BubbleMenu editor={editor} {...{ tippyOptions: { duration: 100 } } as any}>
            <div style={{ 
              background: '#1a1a1e', 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '8px', 
              padding: '0.25rem',
              display: 'flex',
              gap: '0.25rem',
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)'
            }}>
              <button onClick={() => editor.chain().focus().toggleBold().run()} className="toolbar-btn small"><BoldIcon size={14} /></button>
              <button onClick={() => editor.chain().focus().toggleItalic().run()} className="toolbar-btn small"><ItalicIcon size={14} /></button>
              <button onClick={() => editor.chain().focus().toggleCode().run()} className="toolbar-btn small"><CodeIcon size={14} /></button>
            </div>
          </BubbleMenu>
        )}

        <div className="editor-wrapper" style={{ 
          background: 'rgba(255,255,255,0.01)', 
          border: '1px solid rgba(255,255,255,0.05)', 
          borderRadius: '24px',
          padding: '3.5rem',
          minHeight: '600px',
          boxShadow: '0 30px 60px rgba(0,0,0,0.4)',
          outline: 'none',
          position: 'relative',
          transition: 'all 0.3s ease'
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
