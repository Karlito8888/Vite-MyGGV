import { useState, useEffect, useRef } from 'react'
import { useUser } from '../contexts'
import { toast } from 'react-toastify'
import { PaperAirplaneIcon, PhotoIcon, TrashIcon } from '@heroicons/react/24/solid'
import {
  listChannelMessages,
  sendMessage,
  sendImageMessage,
  deleteMessage
} from '../services/chatService'
import { supabase } from '../utils/supabase'
import Avatar from '../components/Avatar'
import ImageModal from '../components/ImageModal'
import ConfirmModal from '../components/ConfirmModal'
import UserProfileModal from '../components/UserProfileModal'
import styles from '../styles/Chat.module.css'

function Chat() {
  const { user, profile } = useUser()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [longPressedMessageId, setLongPressedMessageId] = useState(null)
  const [messageToDelete, setMessageToDelete] = useState(null)
  const [selectedUserId, setSelectedUserId] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)
  const longPressTimer = useRef(null)
  const channelId = 'general' // General channel for all users

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Load existing messages
  useEffect(() => {
    loadMessages()
  }, [])

  // Subscribe to new messages in real-time
  useEffect(() => {
    if (!user) return

    console.log('[REALTIME] 🔌 Subscribing to chat channel:', `chat-${channelId}`)
    const channel = supabase
      .channel(`chat-${channelId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
          // Fetch profile data
          const { data: profileData } = await supabase
            .from('profiles')
            .select('username, avatar_url, full_name')
            .eq('id', payload.new.user_id)
            .single()

          const messageWithProfile = {
            ...payload.new,
            profiles: profileData
          }

          setMessages((current) => {
            // Avoid duplicates
            if (current.some(msg => msg.id === messageWithProfile.id)) {
              return current
            }
            return [...current, messageWithProfile]
          })
        }
      )
      .subscribe((status) => {
        console.log('[REALTIME] 📡 Chat channel status:', status, `chat-${channelId}`)
      })

    return () => {
      console.log('[REALTIME] 🔌 Unsubscribing from chat channel:', `chat-${channelId}`)
      supabase.removeChannel(channel)
    }
  }, [user]) // Removed channelId since it's constant 'general'

  const loadMessages = async () => {
    setLoading(true)
    try {
      const { data, error } = await listChannelMessages(channelId, 100)

      if (error) throw error

      // Reverse to show oldest first
      setMessages(data ? data.reverse() : [])
    } catch (error) {
      console.error('Error loading messages:', error)
      toast.error('Error loading messages')
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!newMessage.trim() || !user) return

    setSending(true)
    try {
      const { error } = await sendMessage({
        channel_id: channelId,
        content: newMessage.trim()
      })

      if (error) throw error

      setNewMessage('')
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Error sending message')
    } finally {
      setSending(false)
    }
  }

  const handleImageUpload = async (file) => {
    if (!user) {
      toast.error('You must be logged in to send images')
      return
    }

    setUploading(true)
    try {
      const { error } = await sendImageMessage({
        channel_id: channelId,
        image: file,
        content: newMessage.trim() || undefined
      })

      if (error) throw error

      setNewMessage('')
      toast.success('Image sent successfully')
    } catch (error) {
      console.error('Error uploading image:', error)
      toast.error(error.message || 'Error uploading image')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      handleImageUpload(file)
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file)
    } else {
      toast.error('Please drop an image file')
    }
  }

  const handlePaste = (e) => {
    const items = e.clipboardData?.items
    if (!items) return

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile()
        if (file) {
          e.preventDefault()
          handleImageUpload(file)
          break
        }
      }
    }
  }

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return

    try {
      const { error } = await deleteMessage(messageToDelete)
      if (error) throw error

      // Remove from local state immediately
      setMessages((current) => current.filter(msg => msg.id !== messageToDelete))
      setLongPressedMessageId(null)
      toast.success('Message deleted')
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Failed to delete message')
    }
  }

  const handleTouchStart = (messageId) => {
    longPressTimer.current = setTimeout(() => {
      setLongPressedMessageId(messageId)
    }, 1000) // 1000ms long press
  }

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current)
    }
  }

  const formatTime = (timestamp) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInHours = (now - date) / (1000 * 60 * 60)

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } else {
      return date.toLocaleDateString('en-US', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-content">
          <div className={styles.loadingContainer}>
            <div className={styles.spinner}></div>
            <p>Loading chat...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`page-container ${styles.chatPage}`}>
      <div className={`page-content ${styles.chatPageContent}`}>
        <div className="page-header">
          <h2>💬 Live Chat</h2>
          {/* <p className="page-subtitle">Chat in real-time with the community</p> */}
        </div>

        <div
          className={`${styles.chatContainer} ${isDragging ? styles.dragging : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className={styles.dropOverlay}>
              <div className={styles.dropContent}>
                <PhotoIcon className={styles.dropIcon} />
                <p>Drop image here to send</p>
              </div>
            </div>
          )}

          <div className={styles.messagesContainer}>
            {messages.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No messages yet</p>
                <p className={styles.emptySubtext}>Be the first to send a message!</p>
              </div>
            ) : (
              messages.map((message) => {
                const isOwnMessage = message.user_id === user?.id
                const userProfile = message.user || message.profiles
                const displayName = userProfile?.username ||
                  userProfile?.full_name ||
                  'User'

                return (
                  <div
                    key={message.id}
                    className={`${styles.message} ${isOwnMessage ? styles.ownMessage : styles.otherMessage}`}
                  >
                    {!isOwnMessage && (
                      <div
                        className={styles.avatarWrapper}
                        onClick={() => setSelectedUserId(message.user_id)}
                      >
                        <Avatar
                          src={userProfile?.avatar_url}
                          userId={message.user_id}
                          size="small"
                          fallback={displayName.charAt(0).toUpperCase()}
                          showPresence={true}
                        />
                      </div>
                    )}

                    <div className={styles.messageContent}>
                      {!isOwnMessage && (
                        <div className={styles.messageSender}>{displayName}</div>
                      )}
                      <div
                        className={styles.messageWrapper}
                        onTouchStart={() => isOwnMessage && handleTouchStart(message.id)}
                        onTouchEnd={handleTouchEnd}
                        onTouchCancel={handleTouchEnd}
                      >
                        <div className={styles.messageBubble}>
                          {message.message_type === 'image' && message.attachment_url && (
                            <div className={styles.imageMessage}>
                              <img
                                src={message.attachment_url}
                                alt="Shared image"
                                className={styles.messageImage}
                                loading="lazy"
                                onClick={() => setSelectedImage(message.attachment_url)}
                              />
                            </div>
                          )}
                          {message.content && message.content !== '📷 Image' && (
                            <p>{message.content}</p>
                          )}
                        </div>
                        {isOwnMessage && (
                          <button
                            className={`${styles.deleteButton} ${longPressedMessageId === message.id ? styles.visible : ''}`}
                            onClick={() => setMessageToDelete(message.id)}
                            title="Delete message"
                          >
                            <TrashIcon className={styles.deleteIcon} />
                          </button>
                        )}
                      </div>
                      <div className={styles.messageTime}>
                        {formatTime(message.created_at)}
                      </div>
                    </div>

                    {isOwnMessage && (
                      <div
                        className={styles.avatarWrapper}
                        onClick={() => setSelectedUserId(user.id)}
                      >
                        <Avatar
                          src={profile?.avatar_url}
                          userId={user.id}
                          size="small"
                          fallback={(profile?.username || profile?.full_name || 'U').charAt(0).toUpperCase()}
                          showPresence={true}
                        />
                      </div>
                    )}
                  </div>
                )
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className={styles.inputContainer}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className={styles.imageButton}
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading || !user}
              title="Upload image"
            >
              <PhotoIcon className={styles.imageIcon} />
            </button>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onPaste={handlePaste}
              placeholder="Write your message here..."
              className={styles.messageInput}
              disabled={sending || uploading || !user}
              maxLength={500}
            />
            <button
              type="submit"
              className={styles.sendButton}
              disabled={(!newMessage.trim() && !uploading) || sending || !user}
            >
              {uploading ? (
                <div className={styles.uploadingSpinner}></div>
              ) : (
                <PaperAirplaneIcon className={styles.sendIcon} />
              )}
            </button>
          </form>

          {!user && (
            <div className={styles.loginPrompt}>
              You must be logged in to send messages
            </div>
          )}

          {uploading && (
            <div className={styles.uploadingIndicator}>
              Uploading image...
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <ImageModal
          imageUrl={selectedImage}
          onClose={() => setSelectedImage(null)}
        />
      )}

      {/* Confirm Delete Modal */}
      <ConfirmModal
        isOpen={!!messageToDelete}
        onClose={() => setMessageToDelete(null)}
        onConfirm={handleDeleteMessage}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
      />

      {/* User Profile Modal */}
      {selectedUserId && (
        <UserProfileModal
          userId={selectedUserId}
          onClose={() => setSelectedUserId(null)}
        />
      )}
    </div>
  )
}

export default Chat
