  'use client'

  import { useState, useEffect, useRef } from 'react'
  import { motion, AnimatePresence } from 'framer-motion'
  import { Mic, MicOff, MessageCircle, Bot, User, Download } from 'lucide-react'
  import { Button } from '@/components/ui/button'
  import { Card, CardContent } from '@/components/ui/card'
  import { ScrollArea } from '@/components/ui/scroll-area'
  import { downloadTranscript } from '@/utils/transcript'
  import { Conversation } from '@11labs/client'
  import { getSignedUrl } from '@/app/actions/getSignedUrl'

  export default function VoiceAssistant() {
    const [conversation, setConversation] = useState(null)
    const [messages, setMessages] = useState([])
    const [isSpeaking, setIsSpeaking] = useState(false)
    const [isActive, setIsActive] = useState(false)
    const [showChat, setShowChat] = useState(false)
    const [connectionStatus, setConnectionStatus] = useState('disconnected')
    const scrollAreaRef = useRef(null)


  

    useEffect(() => {
      if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
      }
    }, [messages])

    const startConversation = async () => {
      try {
        setConnectionStatus('connecting')
        const { signedUrl } = await getSignedUrl()
        if (!signedUrl) {
          throw new Error('Failed to get signed URL')
        }
        const conv = await Conversation.startSession({
          signedUrl,
          onMessage: (message) => {
            setMessages((prev) => [
              ...prev,
              {
                source: message.source,
                message: message.message,
              },
            ])
          },
          onError: (error) => {
            console.error('Conversation error:', error)
            setConnectionStatus('disconnected')
          },
          onStatusChange: (status) => {
            setConnectionStatus(
              status.status === 'connected' ? 'connected' : 'disconnected'
            )
          },
          onModeChange: (mode) => {
            setIsSpeaking(mode.mode === 'speaking')
          },
        })
        setConversation(conv)
        setIsActive(true)
        setConnectionStatus('connected')
      } catch (error) {
        console.error('Failed to start conversation:', error)
        setConnectionStatus('disconnected')
      }
    }
    
    
    const endConversation = async () => {
      if (conversation) {
        await conversation.endSession();
        setConversation(null);
        setIsSpeaking(false);
        setIsActive(false);
        setConnectionStatus('disconnected');
        
      }
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900 dark:to-green-800 p-4">
        <Card className="w-full max-w-md bg-white dark:bg-green-800 shadow-xl border-2 border-green-300 dark:border-green-600">
          <CardContent className="p-6">
            {/* Voice Assistant Circle */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="relative w-40 h-40 mx-auto mb-8"
            >
              {/* Base Circle */}
              <div className="relative w-full h-full">
                <div
                  className={`absolute inset-0 rounded-full transition-colors duration-300 ${
                    isActive ? 'bg-green-500' : 'bg-green-200 dark:bg-green-700'
                  }`}
                />
                <div className="absolute inset-[10%] rounded-full bg-white dark:bg-green-900" />
                {/* Pulse Effects */}
                {isSpeaking && (
                  <div className="absolute inset-[15%]">
                    <div className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-pulse-fast" />
                    <div className="absolute inset-0 rounded-full bg-green-500 opacity-15 animate-pulse-medium" />
                    <div className="absolute inset-0 rounded-full bg-green-500 opacity-10 animate-pulse-slow" />
                  </div>
                )}
              </div>
            </motion.div>

            {/* Control Buttons */}
            <div className="space-y-4">
              <Button
                onClick={isActive ? endConversation : startConversation}
                className={`w-full ${
                  isActive
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-green-500 hover:bg-green-600 text-white'
                }`}
              >
                {isActive ? (
                  <>
                    <MicOff className="w-5 h-5 mr-2" />
                    End Conversation
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 mr-2" />
                    Start Conversation
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => setShowChat(!showChat)}
                className="w-full border-green-500 text-green-700 hover:bg-green-50 dark:border-green-400 dark:text-green-300 dark:hover:bg-green-800"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                {showChat ? 'Hide Chat' : 'Show Chat'}
              </Button>
            </div>

            {/* Chat area */}
            <AnimatePresence>
              {showChat && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4"
                >
                  <div className="flex justify-end mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => downloadTranscript(messages)}
                      className="text-green-700 hover:text-green-800 hover:bg-green-50 dark:text-green-300 dark:hover:text-green-200 dark:hover:bg-green-800"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download Transcript
                    </Button>
                  </div>
                  <ScrollArea className="h-64 rounded-md border border-green-200 dark:border-green-600">
                    <div className="p-4 space-y-4">
                      {messages.map((message, index) => (
                        <div
                          key={index}
                          className={`flex items-start space-x-2 ${
                            message.source === 'user'
                              ? 'flex-row-reverse'
                              : 'flex-row'
                          }`}
                        >
                          <div className="flex-shrink-0">
                            {message.source === 'user' ? (
                              <User className="w-6 h-6 text-green-600 dark:text-green-400" />
                            ) : (
                              <Bot className="w-6 h-6 text-green-700 dark:text-green-300" />
                            )}
                          </div>
                          <div
                            className={`p-3 rounded-lg max-w-[80%] ${
                              message.source === 'user'
                                ? 'bg-green-100 text-green-800 dark:bg-green-700 dark:text-green-100'
                                : 'bg-green-50 text-green-800 dark:bg-green-800 dark:text-green-100'
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </div>
    )
  }
  