'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Send, Bot, User } from 'lucide-react'
import { OSWindow } from './os-window'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

const suggestedQuestions = [
  'What are your technical skills?',
  'Tell me about your experience',
  'What projects have you built?',
  'Where did you study?',
]

export function RAGWindow() {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [inputValue, setInputValue] = useState('')

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!inputValue.trim() || isLoading) return
    sendMessage({ text: inputValue })
    setInputValue('')
  }

  const handleSuggestion = (question: string) => {
    setInputValue(question)
    inputRef.current?.focus()
  }

  return (
    <OSWindow 
      id="chat"
      title="Ask Jay" 
      icon="💬" 
      defaultPosition={{ x: 'calc(50% + 10px)', y: 20 }}
      defaultSize={{ width: 'calc(50% - 30px)', height: 'calc(100% - 100px)' }}
      headerColor="bg-gradient-to-r from-[#a8edea]/90 to-[#fed6e3]/90"
    >
      <div className="flex flex-col h-full bg-gradient-to-br from-blue-50 to-indigo-50">
        {/* Chat messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col h-full">
              <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center mb-4">
                  <Bot className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Ask me anything</h3>
                <p className="text-sm text-gray-600 mb-6 max-w-sm">
                  I&apos;m Jay&apos;s AI assistant. Ask about experience, skills, projects, or achievements.
                </p>
                
                <div className="flex flex-wrap gap-2 justify-center max-w-md">
                  {suggestedQuestions.map((question) => (
                    <button
                      key={question}
                      onClick={() => handleSuggestion(question)}
                      className="text-xs px-3 py-2 rounded-full border border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-300 transition-all text-blue-700 font-medium"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-tr-sm'
                        : 'bg-white text-gray-800 border border-gray-200 rounded-tl-sm shadow-sm'
                    }`}
                  >
                    {message.parts.map((part, partIndex) => {
                      if (part.type === 'text') {
                        if (message.role === 'assistant') {
                          return (
                            <div key={partIndex} className="prose prose-sm max-w-none">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {part.text}
                              </ReactMarkdown>
                            </div>
                          )
                        }
                        return <span key={partIndex}>{part.text}</span>
                      }
                      return null
                    })}
                  </div>
                  {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-white" />
                  </div>
                  <div className="bg-white border border-gray-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input area */}
        <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white/80 backdrop-blur-sm">
          <div className="flex gap-3">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              placeholder="Ask about my experience, skills, projects..."
              className="flex-1 px-4 py-3 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-xl hover:opacity-90 disabled:opacity-50 transition-all shadow-lg shadow-blue-500/25"
            >
              <Send size={18} />
            </button>
          </div>
        </form>
      </div>
    </OSWindow>
  )
}
