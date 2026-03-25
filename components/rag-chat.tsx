'use client'

import { useState, useRef, useEffect } from 'react'
import { useChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { Send, Bot, User, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

interface RagChatProps {
  fullWidth?: boolean
  className?: string
  heightClass?: string
}

export function RagChat({ fullWidth = false, className, heightClass }: RagChatProps) {
  const [input, setInput] = useState('')
  const messagesContainerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat' }),
  })

  const isLoading = status === 'streaming' || status === 'submitted'

  useEffect(() => {
    const container = messagesContainerRef.current
    if (!container) return
    container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' })
  }, [messages])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return
    sendMessage({ text: input })
    setInput('')
  }

  const suggestedQuestions = [
    'What are your technical skills?',
    'Tell me about your work experience',
    'What projects have you built?',
    'What are your achievements?',
    'Where did you study?',
    'How can I contact you?',
  ]

  const chatHeightClass =
    heightClass ?? (fullWidth ? 'h-[600px] w-full' : 'h-[520px] w-full md:h-[600px]')

  return (
    <motion.div
      className={cn(
        'flex flex-col rounded-2xl glass overflow-hidden border border-primary/20 shadow-2xl shadow-primary/10',
        chatHeightClass,
        className
      )}
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45 }}
    >
      <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-background/30">
        <AnimatePresence mode="popLayout">
          {messages.length === 0 ? (
            <motion.div
              className="flex flex-col h-full text-center"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="w-full flex flex-col items-center pt-6">
                <p className="text-sm text-muted-foreground mb-6 max-w-md">
                  Ask me about my experience, projects, education, or achievements.
                </p>
                <div className={cn('flex flex-wrap gap-2 justify-center', fullWidth ? 'max-w-2xl' : 'max-w-md')}>
                {suggestedQuestions.slice(0, fullWidth ? 6 : 5).map((question, i) => (
                  <motion.button
                    key={question}
                    onClick={() => {
                      setInput(question)
                      inputRef.current?.focus()
                    }}
                    className="text-xs px-4 py-2 rounded-full border border-primary/30 bg-primary/10 hover:bg-primary/20 hover:border-primary/50 hover:text-primary transition-all text-muted-foreground font-medium"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.08 }}
                    whileHover={{ scale: 1.04, y: -2 }}
                    whileTap={{ scale: 0.96 }}
                  >
                    {question}
                  </motion.button>
                ))}
                </div>
              </div>

              <div className="w-full max-w-2xl mt-auto mb-2">
                <div className="flex items-start gap-3 justify-start">
                  <div className="flex items-start justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 shrink-0">
                    <Bot className="w-5 h-5 text-primary mt-2.5" />
                  </div>
                  <div className="bg-secondary/80 text-foreground rounded-2xl rounded-tl-sm px-5 py-4 border border-border/50 text-left">
                    <p className="text-xl md:text-2xl font-semibold leading-tight">What would you like to know about me?</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <>
              {messages.map((message, index) => (
                <motion.div
                  key={message.id}
                  className={cn('flex gap-3', message.role === 'user' ? 'justify-end' : 'justify-start')}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ delay: index * 0.05 }}
                >
                  {message.role === 'assistant' && (
                    <div className="flex items-start justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 shrink-0">
                      <Bot className="w-5 h-5 text-primary mt-2.5" />
                    </div>
                  )}
                  <div
                    className={cn(
                      'max-w-[75%] rounded-2xl px-5 py-3 text-sm shadow-lg',
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-tr-sm'
                        : 'bg-secondary/80 text-foreground rounded-tl-sm border border-border/50'
                    )}
                  >
                    {message.parts.map((part, partIndex) => {
                      if (part.type === 'text') {
                        if (message.role === 'assistant') {
                          return (
                            <div key={partIndex} className="prose prose-sm prose-invert max-w-none leading-relaxed">
                              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {part.text}
                              </ReactMarkdown>
                            </div>
                          )
                        }
                        return (
                          <span key={partIndex} className="whitespace-pre-wrap leading-relaxed">
                            {part.text}
                          </span>
                        )
                      }
                      return null
                    })}
                  </div>
                  {message.role === 'user' && (
                    <div className="flex items-start justify-center w-10 h-10 rounded-xl bg-primary shrink-0">
                      <User className="w-5 h-5 text-primary-foreground mt-2.5" />
                    </div>
                  )}
                </motion.div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <motion.div className="flex gap-3" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                  <div className="flex items-start justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 shrink-0">
                    <Bot className="w-5 h-5 text-primary mt-2.5" />
                  </div>
                  <div className="bg-secondary/80 rounded-2xl rounded-tl-sm px-5 py-4 border border-border/50">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2.5 h-2.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-border/50 bg-secondary/30">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/50" />
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about my experience, skills, projects..."
              disabled={isLoading}
              className="w-full pl-11 pr-5 py-3.5 text-sm rounded-xl border border-border/50 bg-background/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 disabled:opacity-50 transition-all"
            />
          </div>
          <Button
            type="submit"
            size="icon"
            disabled={isLoading || !input.trim()}
            className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 transition-all hover:scale-105 shadow-lg shadow-primary/25"
          >
            <Send className="w-5 h-5" />
          </Button>
        </div>
      </form>
    </motion.div>
  )
}
