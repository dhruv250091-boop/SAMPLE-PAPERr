'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {
  Bot,
  Send,
  Plus,
  MessageSquare,
  Trash2,
  Edit2,
  Check,
  X,
  ExternalLink,
  BookOpen,
  Loader2,
  Search,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Menu,
  Copy,
  Camera,
  Image as ImageIcon,
  Paperclip,
  RefreshCw,
  FileText,
  Square
} from 'lucide-react';

interface ChatOption {
  label: string;
  value: string;
  type: 'SUBJECT' | 'YEAR' | 'ACTION' | 'LINK';
  payload?: Record<string, unknown>;
}

interface ChatMessage {
  id: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  imageUrl?: string | null;
  options?: ChatOption[];
  paper?: Record<string, unknown> | null;
  createdAt: string | Date;
  isStreaming?: boolean;
}

interface ConversationItem {
  id: string;
  title: string;
  subjectCode?: string | null;
  paperId?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface SelectedImageInfo {
  file?: File;
  previewUrl: string;
  base64Url?: string;
  fileName: string;
  fileSize: number;
  isFromCamera?: boolean;
}

export default function ChatInterface() {
  const { data: session } = useSession();

  // State
  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState('');

  // Image & Camera State
  const [selectedImage, setSelectedImage] = useState<SelectedImageInfo | null>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<'user' | 'environment'>('environment');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [enlargedImageUrl, setEnlargedImageUrl] = useState<string | null>(null);

  // Renaming state
  const [editingConvId, setEditingConvId] = useState<string | null>(null);
  const [editTitleText, setEditTitleText] = useState('');

  // Active Subject & Paper context
  const [activeSubject, setActiveSubject] = useState<string | null>(null);
  const [activePaperId, setActivePaperId] = useState<string | null>(null);

  // Copied message state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isUserScrolledUp, setIsUserScrolledUp] = useState(false);
  const shouldAutoScrollRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsLoading(false);
  };

  const handleChatScroll = () => {
    if (!chatContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = chatContainerRef.current;
    const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
    if (distanceFromBottom > 100) {
      setIsUserScrolledUp(true);
      shouldAutoScrollRef.current = false;
    } else {
      setIsUserScrolledUp(false);
      shouldAutoScrollRef.current = true;
    }
  };

  const scrollToBottom = (force = false) => {
    if (force || shouldAutoScrollRef.current) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    if (shouldAutoScrollRef.current) {
      scrollToBottom();
    }
  }, [messages.length, isLoading]);

  useEffect(() => {
    if (session?.user) {
      loadConversations();
    }
  }, [session]);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  // Attach video stream when camera opens
  useEffect(() => {
    if (isCameraOpen && cameraStream && videoRef.current) {
      videoRef.current.srcObject = cameraStream;
    }
  }, [isCameraOpen, cameraStream]);

  const loadConversations = async () => {
    try {
      const res = await fetch('/api/conversations');
      if (res.ok) {
        const data = await res.json();
        setConversations(data.conversations || []);
      }
    } catch (err) {
      console.error('Failed to load conversations:', err);
    }
  };

  const selectConversation = async (convId: string) => {
    setCurrentConversationId(convId);
    setSidebarOpen(false);
    setIsLoading(true);
    try {
      const res = await fetch(`/api/conversations/${convId}`);
      if (res.ok) {
        const data = await res.json();
        if (data.conversation) {
          setActiveSubject(data.conversation.subjectCode || null);
          setActivePaperId(data.conversation.paperId || null);

          const formatted = (data.conversation.messages || []).map((m: {
            id: string;
            role: 'USER' | 'ASSISTANT' | 'SYSTEM';
            content: string;
            imageUrl?: string | null;
            metadata?: string | null;
            createdAt: string;
          }) => {
            let parsedMeta: Record<string, unknown> = {};
            try {
              if (m.metadata) parsedMeta = JSON.parse(m.metadata);
            } catch {
              // ignore
            }
            return {
              id: m.id,
              role: m.role,
              content: m.content,
              imageUrl: m.imageUrl || (parsedMeta.imageUrl as string | undefined),
              options: parsedMeta.options as ChatOption[] | undefined,
              paper: parsedMeta.paper as Record<string, unknown> | undefined,
              createdAt: m.createdAt
            };
          });

          setMessages(formatted);
        }
      }
    } catch (err) {
      console.error('Failed to load conversation details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setActiveSubject(null);
    setActivePaperId(null);
    setInputMessage('');
    setSelectedImage(null);
    setSidebarOpen(false);
  };

  // Camera Management
  const startCamera = async (facing: 'user' | 'environment' = 'environment') => {
    try {
      setCameraError(null);
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: facing },
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      });
      setCameraStream(stream);
      setCameraFacing(facing);
      setIsCameraOpen(true);
    } catch (err: unknown) {
      console.error('Camera access error:', err);
      setCameraError('Unable to access device camera. Please check browser permissions or upload an image file instead.');
      setIsCameraOpen(true);
    }
  };

  const switchCamera = () => {
    const nextFacing = cameraFacing === 'environment' ? 'user' : 'environment';
    startCamera(nextFacing);
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraOpen(false);
    setCameraError(null);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      const byteSize = Math.round((dataUrl.length * 3) / 4);
      setSelectedImage({
        previewUrl: dataUrl,
        base64Url: dataUrl,
        fileName: `camera-question-${Date.now()}.jpg`,
        fileSize: byteSize,
        isFromCamera: true
      });
    }
    stopCamera();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert('Selected image exceeds the 10MB limit. Please choose a smaller file.');
      return;
    }

    const validMimes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validMimes.includes(file.type)) {
      alert('Please upload a valid JPG, PNG, or WEBP image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setSelectedImage({
        file,
        previewUrl: result,
        base64Url: result,
        fileName: file.name,
        fileSize: file.size,
        isFromCamera: false
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Streaming typewriter simulator for ChatGPT-like responsiveness
  const streamBotMessage = (botMessageId: string, fullText: string, options?: ChatOption[], paper?: Record<string, unknown> | null) => {
    const words = fullText.split(' ');
    let currentIdx = 0;
    const chunkSize = Math.max(1, Math.floor(words.length / 50));

    const interval = setInterval(() => {
      currentIdx += chunkSize;
      if (currentIdx >= words.length) {
        clearInterval(interval);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? { ...msg, content: fullText, isStreaming: false, options, paper }
              : msg
          )
        );
      } else {
        const partialText = words.slice(0, currentIdx).join(' ');
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === botMessageId
              ? { ...msg, content: partialText, isStreaming: true }
              : msg
          )
        );
      }
    }, 20);
  };

  const handleSendMessage = async (
    textToSend?: string,
    actionOverride?: 'TEXT' | 'SELECT_SUBJECT' | 'SELECT_YEAR' | 'REQUEST_ANSWERS',
    paperIdOverride?: string | null,
    subjectCodeOverride?: string | null
  ) => {
    const text = (textToSend || inputMessage).trim();
    const imageToProcess = selectedImage;

    // Must have either text or image
    if ((!text && !imageToProcess) || isLoading) return;

    shouldAutoScrollRef.current = true;
    setIsUserScrolledUp(false);
    setTimeout(() => scrollToBottom(true), 60);

    setInputMessage('');
    setSelectedImage(null);

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // 1. Upload image if present
    let uploadedImageUrl: string | null = null;
    if (imageToProcess) {
      try {
        if (imageToProcess.file) {
          const formData = new FormData();
          formData.append('image', imageToProcess.file);
          const uploadRes = await fetch('/api/chatbot/upload-image', {
            method: 'POST',
            body: formData
          });
          if (uploadRes.ok) {
            const data = await uploadRes.json();
            uploadedImageUrl = data.url;
          }
        } else if (imageToProcess.base64Url) {
          const uploadRes = await fetch('/api/chatbot/upload-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              dataUrl: imageToProcess.base64Url,
              filename: imageToProcess.fileName
            })
          });
          if (uploadRes.ok) {
            const data = await uploadRes.json();
            uploadedImageUrl = data.url;
          }
        }
      } catch (uploadErr) {
        console.warn('Image upload endpoint fallback to dataUrl:', uploadErr);
        uploadedImageUrl = imageToProcess.previewUrl;
      }
    }

    const messageText = text || 'Please inspect and solve the question shown in this image.';

    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      role: 'USER',
      content: messageText,
      imageUrl: uploadedImageUrl || imageToProcess?.previewUrl,
      createdAt: new Date()
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);
    abortControllerRef.current = new AbortController();

    const effectivePaperId = paperIdOverride !== undefined ? paperIdOverride : activePaperId;
    const effectiveSubject = subjectCodeOverride !== undefined ? subjectCodeOverride : activeSubject;

    try {
      const res = await fetch('/api/chatbot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          message: messageText,
          conversationId: currentConversationId,
          subjectCode: effectiveSubject,
          paperId: effectivePaperId,
          action: actionOverride || 'TEXT',
          imageUrl: uploadedImageUrl,
          imageBase64: imageToProcess?.base64Url
        })
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Study Chat Bot is temporarily unavailable. Please try again shortly.');
      }

      const replyData = await res.json();

      if (!currentConversationId && replyData.conversationId) {
        setCurrentConversationId(replyData.conversationId);
        if (session?.user) {
          loadConversations();
        }
      }

      const botMsgId = `bot-${Date.now()}`;
      const placeholderBotMsg: ChatMessage = {
        id: botMsgId,
        role: 'ASSISTANT',
        content: '',
        isStreaming: true,
        createdAt: new Date()
      };

      setMessages((prev) => [...prev, placeholderBotMsg]);

      streamBotMessage(botMsgId, replyData.replyText, replyData.options, replyData.paper);

      if (replyData.paper?.id) {
        setActivePaperId(replyData.paper.id as string);
      }
      if (replyData.paper?.subjectCode) {
        setActiveSubject(replyData.paper.subjectCode as string);
      }
    } catch (err: unknown) {
      const error = err as Error;
      if (error.name === 'AbortError') {
        // Generation was intentionally stopped by the student
        return;
      }
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        role: 'ASSISTANT',
        content: `Error: ${error.message || 'Failed to process inquiry. Please check your connection and try again.'}`,
        createdAt: new Date()
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  };

  const handleOptionClick = (option: ChatOption) => {
    if (option.type === 'SUBJECT') {
      setActiveSubject(option.value);
      handleSendMessage(option.value, 'SELECT_SUBJECT', activePaperId, option.value);
    } else if (option.type === 'YEAR') {
      const pId = (option.payload?.paperId as string) || option.value;
      setActivePaperId(pId);
      handleSendMessage(option.label, 'SELECT_YEAR', pId, activeSubject);
    } else if (option.type === 'ACTION') {
      if (option.payload?.action === 'REQUEST_ANSWERS') {
        const pId = (option.payload?.paperId as string) || activePaperId;
        if (pId) setActivePaperId(pId);
        handleSendMessage('Yes, show the answers', 'REQUEST_ANSWERS', pId, activeSubject);
      } else {
        handleSendMessage(option.label);
      }
    } else if (option.type === 'LINK' && option.payload?.url) {
      window.open(option.payload.url as string, '_blank');
    }
  };

  const handleRename = async (convId: string) => {
    if (!editTitleText.trim()) {
      setEditingConvId(null);
      return;
    }
    try {
      const res = await fetch(`/api/conversations/${convId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitleText.trim() })
      });
      if (res.ok) {
        setConversations((prev) =>
          prev.map((c) => (c.id === convId ? { ...c, title: editTitleText.trim() } : c))
        );
      }
    } catch (err) {
      console.error('Failed to rename conversation:', err);
    } finally {
      setEditingConvId(null);
      setEditTitleText('');
    }
  };

  const handleDelete = async (convId: string) => {
    if (!confirm('Are you sure you want to delete this study chat?')) return;
    try {
      const res = await fetch(`/api/conversations/${convId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setConversations((prev) => prev.filter((c) => c.id !== convId));
        if (currentConversationId === convId) {
          handleNewChat();
        }
      }
    } catch (err) {
      console.error('Failed to delete conversation:', err);
    }
  };

  const handleCopyMessage = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchHistory.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100dvh-4rem)] max-h-[100dvh] w-full overflow-hidden bg-[var(--bg-main)] text-[var(--text-primary)] transition-colors">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar: Chat History */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#07070A] border-r border-purple-500/20 text-white flex flex-col transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
          <button
            type="button"
            onClick={handleNewChat}
            className="btn-pop flex-1 flex items-center justify-center space-x-2 px-3 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#581C87] hover:from-[#A855F7] hover:to-[#7C3AED] text-white font-bold text-xs shadow-[0_0_15px_rgba(139,92,246,0.4)] border border-purple-400/30 transition-all cursor-pointer font-heading"
          >
            <Plus className="w-4 h-4" />
            <span>New Study Chat</span>
          </button>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="p-2 text-[#A3A3B5] hover:text-white lg:hidden ml-2 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Chat History */}
        <div className="p-3 border-b border-purple-500/20">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#707085]" />
            <input
              type="text"
              placeholder="Search previous chats..."
              value={searchHistory}
              onChange={(e) => setSearchHistory(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-[#09090D] border border-purple-500/20 text-xs text-white placeholder:text-[#707085] focus:outline-none focus:border-[#8B5CF6] transition-colors"
            />
          </div>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {filteredConversations.length === 0 ? (
            <div className="p-4 text-center text-xs text-[#707085]">
              {searchHistory ? 'No chats found matching search.' : 'No chat history yet. Ask a question to begin!'}
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = conv.id === currentConversationId;
              const isEditing = conv.id === editingConvId;

              return (
                <div
                  key={conv.id}
                  className={`btn-pop group relative flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-purple-500/20 border border-purple-500/40 text-white font-semibold shadow-sm'
                      : 'hover:bg-purple-500/10 text-[#A3A3B5] hover:text-white'
                  }`}
                  onClick={() => !isEditing && selectConversation(conv.id)}
                >
                  <div className="flex items-center space-x-2.5 truncate flex-1 min-w-0 pr-2">
                    <MessageSquare className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-purple-400' : 'text-[#707085]'}`} />
                    {isEditing ? (
                      <input
                        type="text"
                        value={editTitleText}
                        onChange={(e) => setEditTitleText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleRename(conv.id);
                          if (e.key === 'Escape') setEditingConvId(null);
                        }}
                        autoFocus
                        className="w-full px-2 py-0.5 rounded bg-black/50 border border-purple-500 text-xs text-white focus:outline-none"
                      />
                    ) : (
                      <span className="truncate">{conv.title}</span>
                    )}
                  </div>

                  {session?.user && (
                    <div className="hidden group-hover:flex items-center space-x-1 shrink-0">
                      {isEditing ? (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRename(conv.id);
                            }}
                            className="p-1 hover:text-emerald-400 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingConvId(null);
                            }}
                            className="p-1 hover:text-rose-400 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingConvId(conv.id);
                              setEditTitleText(conv.title);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                            title="Rename chat"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(conv.id);
                            }}
                            className="p-1 text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                            title="Delete chat"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* User profile / login hint */}
        <div className="p-3 border-t border-purple-500/20 text-[11px] text-[#A3A3B5]">
          {session?.user ? (
            <p className="truncate">Signed in as {session.user.email}</p>
          ) : (
            <p className="text-purple-400">Sign in to save and sync chat history across devices.</p>
          )}
        </div>
      </aside>

      {/* Main Chat Canvas */}
      <div className="flex-1 flex flex-col h-full bg-[#09090D] overflow-hidden relative">
        {/* Top Chat Header */}
        <div className="h-14 border-b border-purple-500/20 bg-[#0B0B10]/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between shrink-0 shadow-lg shadow-black/60">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-1 rounded-xl text-[#A3A3B5] hover:text-white lg:hidden min-h-[40px] min-w-[40px] flex items-center justify-center cursor-pointer"
              aria-label="Open chat history menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#581C87] border border-purple-400/40 flex items-center justify-center text-white shadow-[0_0_12px_rgba(139,92,246,0.5)]">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-extrabold text-white font-heading">Study Chat Bot</h2>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {activeSubject && (
              <span className="px-2.5 py-1 rounded-xl bg-purple-500/15 border border-purple-500/30 text-[11px] sm:text-xs font-bold text-purple-400 font-mono">
                {activeSubject}
              </span>
            )}
            <button
              type="button"
              onClick={handleNewChat}
              className="btn-pop px-3 py-1.5 rounded-xl border border-purple-500/30 bg-[#12121A] hover:bg-purple-500/20 text-[#A3A3B5] hover:text-white text-xs font-semibold flex items-center space-x-1 transition-all cursor-pointer shadow-xs min-h-[38px]"
              title="Start New Chat"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </button>
          </div>
        </div>

        {/* Message Feed Canvas */}
        <div
          ref={chatContainerRef}
          onScroll={handleChatScroll}
          className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-5 relative"
        >
          {/* Welcome Screen if no messages */}
          {messages.length === 0 && (
            <div className="max-w-2xl mx-auto py-6 sm:py-10 text-center space-y-5 sm:space-y-6">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-purple-600 to-purple-950 border border-purple-400 flex items-center justify-center text-white mx-auto shadow-[0_0_25px_rgba(139,92,246,0.6)]">
                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight font-heading">
                  Class 12 Commerce <span className="purple-text-gradient">AI Study Partner</span>
                </h3>
                <p className="text-xs sm:text-sm text-[#A3A3B5] max-w-md mx-auto leading-relaxed px-2">
                  Ask educational questions, take a photo of textbook problems, or retrieve official Maharashtra Board sample papers.
                </p>
              </div>

              {/* Sample Starters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-left pt-1">
                {[
                  {
                    title: 'Practice Sample Papers',
                    prompt: 'I want to practice Class 12 Commerce sample papers'
                  },
                  {
                    title: 'Henri Fayol Principles',
                    prompt: "Explain Henri Fayol's 14 principles of management in simple words"
                  },
                  {
                    title: 'Law of Demand & DMU',
                    prompt: 'Explain the Law of Diminishing Marginal Utility with schedule'
                  },
                  {
                    title: 'Accountancy Adjustments',
                    prompt: 'How to calculate Sacrifice Ratio on admission of partner?'
                  }
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(item.prompt)}
                    className="btn-pop p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#12121A] border border-[#222230] hover:border-purple-500/50 hover:bg-[#181824] text-left transition-all group cursor-pointer shadow-lg min-h-[44px]"
                  >
                    <p className="text-xs font-bold text-white group-hover:text-purple-400 transition-colors flex items-center justify-between font-heading">
                      <span>{item.title}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-[#707085] group-hover:translate-x-0.5 group-hover:text-purple-400 transition-all shrink-0 ml-1" />
                    </p>
                    <p className="text-[11px] text-[#A3A3B5] truncate mt-1">{item.prompt}</p>
                  </button>
                ))}
              </div>

              {/* Multimodal Camera & Upload Feature Banner (Clickable) */}
              <button
                type="button"
                onClick={() => startCamera(cameraFacing)}
                className="w-full btn-pop p-4 sm:p-5 rounded-xl sm:rounded-2xl bg-[#160A24] border border-purple-500/35 hover:border-purple-400 text-left flex items-start space-x-3.5 sm:space-x-4 shadow-[0_0_20px_rgba(139,92,246,0.15)] cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-[#8B5CF6] flex items-center justify-center text-white shrink-0 mt-0.5 shadow-md shadow-purple-950/60">
                  <Camera className="w-5 h-5" />
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-white font-heading flex items-center space-x-1.5">
                    <span>Snap or Upload Question Paper Photos</span>
                    <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
                  </h4>
                  <p className="text-[11px] text-[#C2C2D4] leading-relaxed">
                    Use your device camera or upload an image (JPG, PNG, WEBP) of any question. The AI identifies board sample papers and delivers complete step-by-step solutions with working notes.
                  </p>
                </div>
              </button>
            </div>
          )}

          {/* Render Messages */}
          {messages.map((msg, index) => {
            const isUser = msg.role === 'USER';
            const isLastMessage = index === messages.length - 1;

            return (
              <div
                key={msg.id}
                className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-purple-950 border border-purple-500/40 flex items-center justify-center text-white shrink-0 mt-0.5 shadow-[0_0_12px_rgba(139,92,246,0.5)]">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                )}

                <div
                  className={`p-3.5 sm:p-5 rounded-2xl text-xs sm:text-sm leading-relaxed max-w-[88vw] sm:max-w-2xl relative group break-words ${
                    isUser
                      ? 'bg-gradient-to-r from-[#8B5CF6] to-[#581C87] text-white rounded-br-none shadow-[0_4px_20px_rgba(139,92,246,0.35)] border border-purple-400/30'
                      : 'glass-card-glow text-[#F0F0F5] rounded-bl-none shadow-xl'
                  }`}
                >
                  {/* Image attachment rendering if message has image */}
                  {msg.imageUrl && (
                    <div className="mb-3 overflow-hidden rounded-xl border border-[var(--border-color)] bg-[var(--bg-main)] group/img relative">
                      <img
                        src={msg.imageUrl}
                        alt="Question attachment"
                        className="max-h-64 max-w-full rounded-lg object-contain cursor-pointer transition-transform hover:scale-[1.01]"
                        onClick={() => setEnlargedImageUrl(msg.imageUrl!)}
                      />
                      <button
                        type="button"
                        onClick={() => setEnlargedImageUrl(msg.imageUrl!)}
                        className="absolute bottom-2 right-2 px-2.5 py-1 rounded-md bg-[var(--bg-surface)]/90 text-[11px] text-[var(--text-primary)] border border-[var(--border-color)] hover:text-[#315E9E] flex items-center space-x-1 backdrop-blur-sm shadow-md cursor-pointer transition-opacity opacity-90 group-hover/img:opacity-100 min-h-[36px]"
                      >
                        <Search className="w-3 h-3" />
                        <span>View Full Image</span>
                      </button>
                    </div>
                  )}

                  {isUser ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <>
                      <div className="prose-study overflow-hidden break-words">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {msg.content}
                        </ReactMarkdown>
                      </div>

                      {!msg.isStreaming && msg.content && (
                        <div className="mt-3 pt-2 border-t border-[var(--border-color)] flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                          <button
                            type="button"
                            onClick={() => handleCopyMessage(msg.id, msg.content)}
                            className="inline-flex items-center space-x-1 hover:text-[var(--text-primary)] transition-colors cursor-pointer py-1"
                          >
                            {copiedId === msg.id ? (
                              <>
                                <Check className="w-3 h-3 text-emerald-500" />
                                <span className="text-emerald-500 font-semibold">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="w-3 h-3" />
                                <span>Copy answer</span>
                              </>
                            )}
                          </button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Interactive Option Buttons if present */}
                  {msg.options && msg.options.length > 0 && !msg.isStreaming && (
                    <div className="mt-3 sm:mt-4 pt-3 border-t border-purple-500/25 flex flex-wrap gap-2">
                      {msg.options.map((opt, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => handleOptionClick(opt)}
                          className={`btn-pop inline-flex items-center space-x-1.5 px-3 sm:px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[40px] touch-target ${
                            opt.type === 'ACTION'
                              ? 'bg-gradient-to-r from-[#8B5CF6] to-[#581C87] text-white shadow-[0_0_15px_rgba(139,92,246,0.5)] border border-purple-400/40'
                              : opt.type === 'LINK'
                              ? 'bg-[#181824] hover:bg-purple-950/40 text-purple-300 border border-purple-500/30 shadow-sm'
                              : 'bg-purple-500/15 hover:bg-purple-500/25 text-purple-400 border border-purple-500/30'
                          }`}
                        >
                          {opt.type === 'LINK' ? (
                            <ExternalLink className="w-3.5 h-3.5" />
                          ) : opt.type === 'ACTION' ? (
                            <BookOpen className="w-3.5 h-3.5" />
                          ) : null}
                          <span>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Contextual Follow-up Chips for last assistant message */}
                  {!isUser && isLastMessage && !isLoading && !msg.isStreaming && (
                    <div className="mt-4 pt-3 border-t border-purple-500/20">
                      <p className="text-[11px] font-semibold text-purple-400 mb-2 flex items-center space-x-1">
                        <Sparkles className="w-3 h-3 text-purple-400" />
                        <span>Suggested follow-up questions:</span>
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          'Can you explain it with an example?',
                          'Explain in simple language.',
                          'Can you make this answer shorter?',
                          'What should I remember for the exam?'
                        ].map((chip) => (
                          <button
                            key={chip}
                            type="button"
                            onClick={() => handleSendMessage(chip)}
                            className="btn-pop px-3 py-1.5 rounded-xl bg-[#14141E] border border-purple-500/20 hover:border-purple-500/50 text-[11px] text-[#C2C2D4] hover:text-white transition-all cursor-pointer shadow-sm"
                          >
                            {chip}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing Indicator */}
          {isLoading && (
            <div className="flex items-center justify-between gap-3 max-w-lg mr-auto">
              <div className="flex items-center space-x-2.5 sm:space-x-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-600 to-purple-950 border border-purple-500/40 flex items-center justify-center text-white shrink-0 shadow-[0_0_10px_rgba(139,92,246,0.5)]">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="p-3 sm:p-4 rounded-2xl bg-[#12121A] border border-purple-500/30 text-[#A3A3B5] text-xs flex items-center space-x-2 shadow-xl">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400 shrink-0" />
                  <span className="truncate">Formulating board-standard explanation...</span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleStopGeneration}
                className="btn-pop px-3 py-1.5 rounded-xl border border-rose-500/30 bg-[#1A101C] hover:bg-rose-950/40 text-xs font-semibold text-rose-300 flex items-center space-x-1 cursor-pointer shrink-0 min-h-[36px]"
                title="Stop generation"
              >
                <Square className="w-3 h-3 fill-rose-300" />
                <span className="text-[11px]">Stop</span>
              </button>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Floating Scroll to Latest Button */}
        {isUserScrolledUp && (
          <button
            type="button"
            onClick={() => {
              shouldAutoScrollRef.current = true;
              setIsUserScrolledUp(false);
              scrollToBottom(true);
            }}
            className="btn-pop absolute bottom-24 right-6 px-3.5 py-2 rounded-full bg-[#8B5CF6] hover:bg-[#A855F7] text-white text-xs font-semibold shadow-[0_0_20px_rgba(139,92,246,0.6)] flex items-center space-x-1.5 z-20 cursor-pointer animate-bounce border border-purple-400/40"
          >
            <ChevronDown className="w-3.5 h-3.5" />
            <span>Scroll to latest</span>
          </button>
        )}

        {/* Selected Image Preview Pill (above input bar) */}
        {selectedImage && (
          <div className="px-4 py-2 border-t border-purple-500/20 bg-[#0B0B10] shrink-0">
            <div className="max-w-4xl mx-auto p-2.5 rounded-2xl bg-[#14141E] border border-purple-500/35 flex items-center justify-between shadow-xl">
              <div className="flex items-center space-x-3 truncate">
                <img
                  src={selectedImage.previewUrl}
                  alt="Question Thumbnail"
                  className="w-12 h-12 rounded-xl object-cover border border-purple-500/30 shrink-0 shadow-md"
                />
                <div className="truncate">
                  <p className="text-xs font-bold text-white truncate">
                    {selectedImage.fileName}
                  </p>
                  <p className="text-[10px] text-purple-400 font-mono">
                    {(selectedImage.fileSize / 1024).toFixed(0)} KB • Ready for Vision solver
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {selectedImage.isFromCamera && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedImage(null);
                      startCamera(cameraFacing);
                    }}
                    className="btn-pop px-3 py-1.5 rounded-xl text-xs bg-[#1A1A26] hover:bg-purple-500/20 border border-purple-500/30 text-white font-semibold transition-colors cursor-pointer"
                  >
                    Retake
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="p-1.5 rounded-xl text-[#707085] hover:text-purple-400 hover:bg-purple-500/10 transition-colors cursor-pointer"
                  title="Remove image"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Input Bar */}
        <div className="p-3 sm:p-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] border-t border-purple-500/20 bg-[#0B0B10]/95 backdrop-blur-xl shrink-0">
          {/* Hidden File Input */}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            className="hidden"
          />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="max-w-4xl mx-auto flex items-end gap-1.5 sm:gap-2"
          >
            {/* Attachment & Camera Buttons with Lively Pop & Pulse Animations */}
            <div className="flex items-center space-x-1 sm:space-x-1.5 mb-0.5">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isLoading}
                className="btn-pop group relative p-2 sm:p-2.5 rounded-xl border border-purple-500/30 bg-[#12121A] hover:bg-purple-500/20 text-[#A3A3B5] hover:text-white transition-all cursor-pointer shrink-0 shadow-sm hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] min-h-[44px] min-w-[44px] flex items-center justify-center touch-target"
                title="Upload Question Image (JPG, PNG, WEBP)"
                aria-label="Upload Question Image"
              >
                <ImageIcon className="w-4 h-4 text-purple-400 group-hover:scale-115 transition-transform duration-200" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-purple-500 animate-ping pointer-events-none" />
              </button>
              <button
                type="button"
                onClick={() => startCamera(cameraFacing)}
                disabled={isLoading}
                className="btn-pop group relative p-2 sm:p-2.5 rounded-xl border border-purple-500/30 bg-[#12121A] hover:bg-purple-500/20 text-[#A3A3B5] hover:text-white transition-all cursor-pointer shrink-0 shadow-sm hover:shadow-[0_0_15px_rgba(139,92,246,0.5)] min-h-[44px] min-w-[44px] flex items-center justify-center touch-target"
                title="Take Photo with Camera"
                aria-label="Take Photo with Camera"
              >
                <Camera className="w-4 h-4 text-purple-400 group-hover:scale-115 group-hover:rotate-12 transition-transform duration-200" />
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-purple-600 pointer-events-none" />
              </button>
            </div>

            <textarea
              ref={textareaRef}
              rows={1}
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                e.target.style.height = 'auto';
                e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder={
                selectedImage
                  ? 'Add notes or tap Send to solve...'
                  : 'Ask question, upload photo, or get papers...'
              }
              disabled={isLoading}
              className="flex-1 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-2xl bg-[#09090D] border border-purple-500/25 text-base sm:text-sm text-white placeholder:text-[#707085] focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-purple-600 disabled:opacity-50 transition-colors resize-none max-h-32 leading-normal"
            />

            <button
              type="submit"
              disabled={(!inputMessage.trim() && !selectedImage) || isLoading}
              className="btn-pop px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm bg-gradient-to-r from-[#8B5CF6] to-[#581C87] hover:from-[#A855F7] hover:to-[#7C3AED] text-white disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(139,92,246,0.4)] flex items-center space-x-1.5 transition-all shrink-0 cursor-pointer h-[44px] min-w-[44px] justify-center touch-target mb-0.5"
            >
              <span className="hidden sm:inline">Send</span>
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Camera Modal */}
      {isCameraOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xl rounded-3xl bg-[#0E0E16] border border-purple-500/35 shadow-[0_0_50px_rgba(139,92,246,0.3)] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-purple-500/20 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Camera className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white font-heading">Capture Question Photo</h3>
              </div>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1 rounded-xl text-[#707085] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
              {cameraError ? (
                <div className="p-6 text-center text-[#A3A3B5] space-y-3">
                  <p className="text-xs text-purple-400 font-medium">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      stopCamera();
                      fileInputRef.current?.click();
                    }}
                    className="btn-pop px-4 py-2 rounded-xl text-xs font-bold bg-[#8B5CF6] hover:bg-[#A855F7] text-white transition-colors cursor-pointer"
                  >
                    Upload Image File Instead
                  </button>
                </div>
              ) : (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Guide overlay */}
                  <div className="absolute inset-8 border-2 border-dashed border-purple-500/50 rounded-2xl pointer-events-none flex items-end justify-center p-3">
                    <span className="text-[11px] bg-black/80 text-white px-3 py-1 rounded-xl backdrop-blur-sm border border-purple-500/30 font-medium">
                      Align question or problem statement within frame
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="p-4 bg-[#0E0E16] border-t border-purple-500/20 flex items-center justify-between">
              <button
                type="button"
                onClick={switchCamera}
                className="btn-pop p-2.5 rounded-xl border border-purple-500/25 bg-[#14141E] hover:border-purple-500/40 text-[#A3A3B5] hover:text-white transition-colors flex items-center space-x-1.5 text-xs font-semibold cursor-pointer"
                title="Switch Camera (Front / Back)"
              >
                <RefreshCw className="w-4 h-4" />
                <span className="hidden sm:inline">Switch Camera</span>
              </button>

              <button
                type="button"
                onClick={capturePhoto}
                disabled={Boolean(cameraError)}
                className="btn-pop px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#581C87] hover:from-[#A855F7] hover:to-[#7C3AED] disabled:opacity-40 text-white font-bold text-xs flex items-center space-x-2 shadow-[0_0_20px_rgba(139,92,246,0.5)] border border-purple-400/40 transition-all cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span>Take Snapshot</span>
              </button>

              <button
                type="button"
                onClick={stopCamera}
                className="px-3 py-2 text-xs text-[#707085] hover:text-white cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Image Modal */}
      {enlargedImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setEnlargedImageUrl(null)}
        >
          <div
            className="relative max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden border border-purple-500/30 bg-[#0E0E16] shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-3.5 border-b border-purple-500/20 flex items-center justify-between bg-[#0E0E16]">
              <span className="text-xs font-bold text-white">Attached Question Image</span>
              <button
                type="button"
                onClick={() => setEnlargedImageUrl(null)}
                className="p-1 rounded-lg text-[#707085] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="overflow-auto p-3 flex items-center justify-center max-h-[calc(90vh-60px)]">
              <img
                src={enlargedImageUrl}
                alt="Enlarged Question Attachment"
                className="max-w-full max-h-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
