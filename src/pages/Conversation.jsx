import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { ArrowLeft } from 'lucide-react'
import { PhotoIcon, TrashIcon } from '@heroicons/react/24/solid'
import { useUser } from '../contexts'
import {
  getConversationMessages,
  sendPrivateMessage,
  sendPrivateImageMessage,
  markConversationAsRead,
  deletePrivateMessage
} from '../services/privateMessagesService'
import { supabase } from '../utils/supabase'
import PageTransition from '../components/PageTransition'
import Avatar from '../components/Avatar'
import ImageModal from '../components/ImageModal'
import ConfirmModal from '../components/ConfirmModal'

import styles from '../styles/Conversation.module.css'

function Conversation() {
  const { userId: otherUserId } = useParams()
  const navigate = useNavigate()
  const { profile } = useUser()
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [selectedImage, setSelectedImage] = useState(null)
  const [messageToDelete, setMessageToDelete] = useState(null)
  const [otherUser, setOtherUser] = useState(null)
  const messagesEndRef = useRef(null)
  const fileInputRef = useRef(null)

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Load messages
  const loadMessages = useCallback(async () => {
    if (!profile?.id || !otherUserId) return

    setLoading(true)
    const { data, error } = await getConversationMessages(profile.id, otherUserId)

    if (error) {
      toast.error(
        <div>
          Failed to load messages.
          <br />
          Please try again.
        </div>
      )
    } else if (data) {
      setMessages(data.reverse()) // Reverse to show oldest first

      // Get other user info from first message
      if (data.length > 0) {
        const firstMsg = data[0]
        const otherUserData = firstMsg.sender_id === otherUserId
          ? firstMsg.sender
          : firstMsg.receiver
        setOtherUser(otherUserData)
      }

      // Mark conversation as read
      await markConversationAsRead(otherUserId)
    }

    setLoading(false)
  }, [profile?.id, otherUserId])

  // Handle send message
  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!newMessage.trim()) return

    setSending(true)
    const { data, error } = await sendPrivateMessage({
      receiver_id: otherUserId,
      message: newMessage.trim()
    })

    if (error) {
      toast.error(
        <div>
          Failed to send message.
          <br />
          Please try again.
        </div>
      )
    } else if (data) {
      // Add message with profiles to local state
      const messageWithProfiles = {
        ...data,
        sender: profile,
        receiver: otherUser
      }
      setMessages(prev => [...prev, messageWithProfiles])
      setNewMessage('')
      scrollToBottom()
    }

    setSending(false)
  }

  // Handle image upload
  const handleImageUpload = async (file) => {
    if (!profile) {
      toast.error('You must be logged in to send images')
      return
    }

    setUploading(true)
    try {
      const { data, error } = await sendPrivateImageMessage({
        receiver_id: otherUserId,
        image: file,
        message: newMessage.trim() || undefined
      })

      if (error) throw error

      // Add message with profiles to local state
      if (data) {
        const messageWithProfiles = {
          ...data,
          sender: profile,
          receiver: otherUser
        }
        setMessages(prev => [...prev, messageWithProfiles])
        scrollToBottom()
      }

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

  // Handle delete message
  const handleDeleteMessage = async () => {
    if (!messageToDelete) return

    try {
      const { error } = await deletePrivateMessage(messageToDelete)
      if (error) throw error

      // Remove from local state immediately
      setMessages((current) => current.filter(msg => msg.id !== messageToDelete))
      toast.success('Message deleted')
    } catch (error) {
      console.error('Error deleting message:', error)
      toast.error('Failed to delete message')
    } finally {
      setMessageToDelete(null)
    }
  }



  // Subscribe to real-time messages - direct subscription like Chat.jsx
  useEffect(() => {
    if (!profile?.id || !otherUserId) return

    const channel = supabase
      .channel(`private-conversation-${profile.id}-${otherUserId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'private_messages',
          filter: `receiver_id=eq.${profile.id}`
        },
        async (payload) => {
          // Only add if it's from the current conversation
          if (payload.new.sender_id === otherUserId) {
            // Fetch sender profile
            const { data: senderProfile } = await supabase
              .from('profiles')
              .select('id, username, avatar_url, full_name')
              .eq('id', payload.new.sender_id)
              .single()

            // Fetch receiver profile (current user)
            const { data: receiverProfile } = await supabase
              .from('profiles')
              .select('id, username, avatar_url, full_name')
              .eq('id', payload.new.receiver_id)
              .single()

            const messageWithProfiles = {
              ...payload.new,
              sender: senderProfile,
              receiver: receiverProfile
            }

            setMessages((current) => {
              // Avoid duplicates
              if (current.some(msg => msg.id === messageWithProfiles.id)) {
                return current
              }
              return [...current, messageWithProfiles]
            })

            scrollToBottom()

            // Mark as read
            markConversationAsRead(otherUserId)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [profile?.id, otherUserId])

  // Initial load
  useEffect(() => {
    if (profile?.id && otherUserId) {
      loadMessages()
    }
  }, [profile?.id, otherUserId, loadMessages])

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Redirect if not logged in
  useEffect(() => {
    if (!profile) {
      navigate('/login')
    }
  }, [profile, navigate])

  if (!profile) {
    return null
  }

  if (loading) {
    return (
      <PageTransition style={{ height: '100%' }}>
        <div className={styles.chatPageContainer}>
          <div className={styles.chatPageContent}>
            <div className={styles.loadingContainer}>
              <div className={styles.spinner}></div>
              <p>Loading conversation...</p>
            </div>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition style={{ height: '100%' }}>
      <div className={styles.chatPageContainer}>
        <div className={styles.chatPageContent}>
          {/* Header */}
          <div className="page-header" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <button
              className={styles.backButton}
              onClick={() => navigate('/private-messages')}
              aria-label="Back to conversations"
            >
              <ArrowLeft size={24} />
            </button>
            {otherUser && (
              <>
                <Avatar
                  src={otherUser.avatar_url}
                  userId={otherUserId}
                  alt={otherUser.full_name}
                  size="small"
                  fallback={(otherUser.full_name || otherUser.username || 'U').charAt(0).toUpperCase()}
                  showPresence={true}
                />
                <h2 style={{ margin: 0, flex: 1 }}>
                  {otherUser.full_name || 'Unknown User'}
                </h2>
              </>
            )}
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

            {/* Messages List */}
            <div className={styles.messagesContainer}>
              {messages.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No messages yet</p>
                  <p className={styles.emptySubtext}>
                    Start the conversation!
                  </p>
                </div>
              ) : (
                messages.map((msg) => {
                  const isOwnMessage = msg.sender_id === profile.id
                  const userProfile = isOwnMessage ? profile : otherUser
                  const displayName = userProfile?.full_name || userProfile?.username || 'User'

                  return (
                    <div
                      key={msg.id}
                      className={`${styles.message} ${isOwnMessage ? styles.ownMessage : styles.otherMessage
                        }`}
                    >
                      {!isOwnMessage && (
                        <div className={styles.avatarWrapper}>
                          <Avatar
                            src={otherUser?.avatar_url}
                            userId={otherUserId}
                            alt={displayName}
                            size="small"
                            fallback={displayName.charAt(0).toUpperCase()}
                            showPresence={true}
                          />
                        </div>
                      )}

                      <div className={styles.messageContent}>
                        <div className={styles.messageWrapper}>
                          <div className={styles.messageBubble}>
                            {msg.message_type === 'image' && msg.attachment_url && (
                              <div className={styles.imageMessage}>
                                <img
                                  src={msg.attachment_url}
                                  alt="Shared image"
                                  className={styles.messageImage}
                                  loading="lazy"
                                  onClick={() => setSelectedImage(msg.attachment_url)}
                                />
                              </div>
                            )}
                            {msg.message && msg.message !== '📷 Image' && (
                              <p>{msg.message}</p>
                            )}
                          </div>
                          {isOwnMessage && (
                            <button
                              className={styles.deleteButton}
                              onClick={() => setMessageToDelete(msg.id)}
                              title="Delete message"
                            >
                              <TrashIcon className={styles.deleteIcon} />
                            </button>
                          )}
                        </div>
                        <div className={styles.messageTime}>
                          {new Date(msg.created_at).toLocaleTimeString('en-US', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                          {msg.is_edited && ' (edited)'}
                        </div>
                      </div>

                      {isOwnMessage && (
                        <div className={styles.avatarWrapper}>
                          <Avatar
                            src={profile?.avatar_url}
                            userId={profile?.id}
                            alt={profile?.full_name || profile?.username}
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

            {/* Message Input */}
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
                disabled={uploading || !profile}
                title="Upload image"
              >
                <PhotoIcon className={styles.imageIcon} />
              </button>
              <input
                type="text"
                placeholder="Write your message here..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onPaste={handlePaste}
                className={styles.messageInput}
                disabled={sending || uploading}
                maxLength={500}
              />
              <button
                type="submit"
                className={styles.sendButton}
                disabled={(!newMessage.trim() && !uploading) || sending}
              >
                {uploading ? (
                  <div className={styles.uploadingSpinner}></div>
                ) : (
                  <ArrowLeft size={20} style={{ transform: 'rotate(180deg)' }} />
                )}
              </button>
            </form>

            {uploading && (
              <div className={styles.uploadingIndicator}>
                Uploading image...
              </div>
            )}
          </div>
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
    </PageTransition>
  )
}

export default Conversation
