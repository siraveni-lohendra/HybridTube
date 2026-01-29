import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';

// --- CONFIG & THEMES ---
const THEMES = {
  dark: { bg: '#000000', card: '#121212', text: '#ffffff', editor: '#050505', terminal: '#000', border: '#262626', hover: '#1a1a1a', inputBg: '#262626', secondaryText: '#a8a8a8' },
  light: { bg: '#ffffff', card: '#ffffff', text: '#000000', editor: '#ffffff', terminal: '#f0f0f0', border: '#dbdbdb', hover: '#fafafa', inputBg: '#efefef', secondaryText: '#737373' }
};

const COLORS = { accent: '#ff0000', blue: '#0095f6', green: '#00a884', gold: '#ffcc00', error: '#ed4956', errorBg: '#2d1a1a' };
const API_URL = 'http://127.0.0.1:8000/api';

const FRIENDS = [
  { id: 1, name: 'alex_coder', status: 'Online', pic: '🚀', lastMsg: 'Did you see the new React update?' },
  { id: 2, name: 'sarah_dev', status: 'Offline', pic: '👩‍💻', lastMsg: 'The compiler is fixed!' },
  { id: 3, name: 'hacker_pro', status: 'Online', pic: '🐉', lastMsg: 'Send me the snippet.' }
];

function App() {
  const [page, setPage] = useState('home'); 
  const [theme, setTheme] = useState('dark');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Compiler State
  const [lang, setLang] = useState('python');
  const [userCode, setUserCode] = useState('print("Hello World")');
  const [output, setOutput] = useState({ msg: 'READY', isError: false });
  const [isRunning, setIsRunning] = useState(false);

  // Chat State
  const [activeChat, setActiveChat] = useState(FRIENDS[0]);
  const [typedMsg, setTypedMsg] = useState('');
  const [chatHistory, setChatHistory] = useState({
    1: [{ sender: 'them', text: 'Yo! Is the compiler working?' }],
    2: [{ sender: 'them', text: 'Hey Sarah here.' }],
    3: []
  });
  const chatEndRef = useRef(null);

  const T = THEMES[theme];

  // Auto-scroll chat
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [chatHistory, page]);

  // --- HANDLERS ---
  const handleRunCode = async () => {
    setIsRunning(true);
    setOutput({ msg: "Compiling...", isError: false });
    
    try {
      // Attempt real backend call
      const res = await axios.post(`${API_URL}/tools/compiler/`, { code: userCode, lang });
      setOutput({ msg: res.data.output, isError: false });
    } catch (err) {
      // FALLBACK: Mock execution if backend is offline
      setTimeout(() => {
        if (userCode.includes('print') || userCode.includes('printf') || userCode.includes('cout')) {
          const match = userCode.match(/"([^"]+)"/);
          setOutput({ msg: match ? match[1] : "Execution successful (Mock Mode)", isError: false });
        } else {
          setOutput({ msg: "Runtime Error: Backend not found and code not recognized.", isError: true });
        }
        setIsRunning(false);
      }, 800);
      return;
    }
    setIsRunning(false);
  };

  const sendChatMessage = (e) => {
    e.preventDefault();
    if (!typedMsg.trim()) return;
    
    const newMsg = { sender: 'me', text: typedMsg };
    setChatHistory(prev => ({
      ...prev,
      [activeChat.id]: [...(prev[activeChat.id] || []), newMsg]
    }));
    setTypedMsg('');

    // Simulated "Real World" Auto-Reply
    setTimeout(() => {
      const reply = { sender: 'them', text: "Got it! Checking now... 🔥" };
      setChatHistory(prev => ({
        ...prev,
        [activeChat.id]: [...(prev[activeChat.id] || []), reply]
      }));
    }, 1500);
  };

  const navigate = (p) => { setPage(p); setIsSidebarOpen(false); };

  return (
    <div style={{...s.main, background: T.bg, color: T.text}}>
      <style>{`body { margin: 0; font-family: -apple-system, sans-serif; overflow: hidden; }`}</style>

      {/* HEADER */}
      <header style={{...s.header, borderBottom: `1px solid ${T.border}`, background: T.bg}}>
        <div style={s.headerLeft}>
          <div style={s.hamburger} onClick={() => setIsSidebarOpen(!isSidebarOpen)}>☰</div>
          <div style={s.logo} onClick={() => navigate('home')}>Hybrid<span>Tube</span></div>
        </div>
        <div style={s.headerRight}>
          <div style={s.iconBtn} onClick={() => navigate('chat')}>✉️</div>
          <button style={{...s.themeBtn, color: T.text}} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          <div style={{...s.profileIcon, background: COLORS.blue}} onClick={() => navigate('profile')}>👨‍💻</div>
        </div>
      </header>

      {/* SIDEBAR */}
      {isSidebarOpen && <div style={s.overlay} onClick={() => setIsSidebarOpen(false)} />}
      <nav style={{...s.sidebar, transform: isSidebarOpen ? 'translateX(0)' : 'translateX(-100%)', background: T.bg, borderRight: `1px solid ${T.border}`}}>
        <div style={s.sideItem(page === 'home', T)} onClick={() => navigate('home')}>🏠 Home</div>
        <div style={s.sideItem(page === 'code', T)} onClick={() => navigate('code')}>💻 Compiler</div>
        <div style={s.sideItem(page === 'chat', T)} onClick={() => navigate('chat')}>💬 Messages</div>
        <div style={s.sideItem(page === 'profile', T)} onClick={() => navigate('profile')}>👤 Profile</div>
      </nav>

      {/* CONTENT */}
      <main style={s.content}>
        {page === 'code' && (
          <div style={{...s.ide, border: `1px solid ${T.border}`, background: T.card}}>
            <div style={s.toolbar}>
              <select style={s.select(T)} value={lang} onChange={e => setLang(e.target.value)}>
                <option value="python">Python</option>
                <option value="cpp">C++</option>
              </select>
              <button style={s.runBtn(isRunning)} onClick={handleRunCode}>{isRunning ? '...' : 'RUN'}</button>
            </div>
            <textarea style={{...s.editor, background: T.editor, color: T.text}} value={userCode} onChange={e => setUserCode(e.target.value)} />
            <div style={{...s.terminal, background: output.isError ? COLORS.errorBg : T.terminal, color: output.isError ? COLORS.error : COLORS.green}}>
              {output.msg}
            </div>
          </div>
        )}

        {page === 'chat' && (
          <div style={{...s.chatContainer, border: `1px solid ${T.border}`}}>
            <div style={{...s.friendsList, borderRight: `1px solid ${T.border}`}}>
              {FRIENDS.map(f => (
                <div key={f.id} style={s.friendCard(activeChat.id === f.id, T)} onClick={() => setActiveChat(f)}>
                  <div style={s.friendPic}>{f.pic}</div>
                  <div>
                    <div style={{fontWeight:'bold', fontSize:'14px'}}>{f.name}</div>
                    <div style={{fontSize:'11px', color: COLORS.green}}>{f.status}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={s.chatBox}>
              <div style={{...s.chatHeader, borderBottom: `1px solid ${T.border}`}}><b>{activeChat.name}</b></div>
              <div style={s.messageArea}>
                {chatHistory[activeChat.id].map((m, i) => (
                  <div key={i} style={s.msgWrapper(m.sender === 'me')}>
                    <div style={s.bubble(m.sender === 'me', T)}>{m.text}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <form style={s.inputArea} onSubmit={sendChatMessage}>
                <input style={{...s.chatInput, background: T.inputBg, color: T.text, border: `1px solid ${T.border}`}} 
                       placeholder="Message..." value={typedMsg} onChange={e => setTypedMsg(e.target.value)} />
                <button type="submit" style={s.sendBtn}>Send</button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const s = {
  main: { height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column' },
  header: { height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', zIndex: 1100 },
  headerLeft: { display: 'flex', alignItems: 'center', gap: '20px' },
  headerRight: { display: 'flex', gap: '20px', alignItems: 'center' },
  logo: { color: COLORS.accent, fontWeight: 'bold', fontSize: '20px', cursor: 'pointer' },
  iconBtn: { fontSize: '22px', cursor: 'pointer' },
  sidebar: { position: 'fixed', top: '60px', left: 0, height: '100%', width: '240px', transition: '0.3s', zIndex: 1050 },
  sideItem: (active, T) => ({ padding: '15px', cursor: 'pointer', background: active ? T.hover : 'transparent' }),
  content: { flex: 1, padding: '20px', display: 'flex', justifyContent: 'center', overflow: 'hidden' },
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000 },
  
  // Compiler
  ide: { width: '100%', maxWidth: '800px', height: '80vh', display: 'flex', flexDirection: 'column', borderRadius: '8px', overflow: 'hidden' },
  toolbar: { padding: '10px', display: 'flex', justifyContent: 'space-between', background: 'rgba(255,255,255,0.05)' },
  editor: { flex: 1, padding: '20px', fontFamily: 'monospace', fontSize: '16px', outline: 'none', border: 'none', resize: 'none' },
  terminal: { height: '100px', padding: '15px', fontFamily: 'monospace', borderTop: '1px solid #333' },
  runBtn: (isRunning) => ({ background: isRunning ? '#333' : COLORS.green, color: '#fff', border: 'none', padding: '5px 20px', borderRadius: '4px', cursor: 'pointer' }),
  
  // FIXED LINE 194: Added closing parenthesis ')'
  select: (T) => ({ background: T.bg, color: T.text, border: '1px solid #444', borderRadius: '4px' }),

  // Chat
  chatContainer: { width: '100%', maxWidth: '900px', height: '80vh', display: 'flex', borderRadius: '8px', overflow: 'hidden' },
  friendsList: { width: '260px', display: 'flex', flexDirection: 'column', overflowY: 'auto' },
  friendCard: (active, T) => ({ display: 'flex', gap: '12px', padding: '15px', cursor: 'pointer', background: active ? T.hover : 'transparent' }),
  friendPic: { width: '40px', height: '40px', borderRadius: '50%', background: '#333', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  chatBox: { flex: 1, display: 'flex', flexDirection: 'column' },
  chatHeader: { padding: '15px' },
  messageArea: { flex: 1, padding: '20px', overflowY: 'auto' },
  msgWrapper: (isMe) => ({ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', marginBottom: '10px' }),
  bubble: (isMe, T) => ({ padding: '10px 15px', borderRadius: '18px', background: isMe ? COLORS.blue : T.hover, maxWidth: '70%', fontSize: '14px' }),
  inputArea: { padding: '15px', display: 'flex', gap: '10px' },
  chatInput: { flex: 1, padding: '10px 15px', borderRadius: '20px', outline: 'none' },
  sendBtn: { background: 'none', border: 'none', color: COLORS.blue, fontWeight: 'bold', cursor: 'pointer' }
};

export default App;