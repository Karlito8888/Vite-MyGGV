import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { useUser } from '../contexts'
import { usePageVisibility } from '../hooks/usePageVisibility'
import {
    getUserConversations,
    deleteConversation
} from '../services/privateMessagesService'
import { subscribeToPrivateMessages } from '../services/privateMessagesService'
import PageTransition from '../components/PageTransition'
import Card, { CardContent } from '../components/ui/Card'
import Avatar from '../components/Avatar'
import ConfirmModal from '../components/ConfirmModal'
import { ClimbingBoxLoader } from 'react-spinners'
import styles from '../styles/PrivateMessages.module.css'
import { TrashIcon } from '@heroicons/react/24/outline'

function PrivateMessages() {
    const navigate = useNavigate()
    const { profile } = useUser()
    const isVisible = usePageVisibility()
    const [conversations, setConversations] = useState([])
    const [loading, setLoading] = useState(true)
    const [conversationToDelete, setConversationToDelete] = useState(null)

    // Handle conversation selection
    const handleSelectConversation = (conversation) => {
        navigate(`/private-messages/${conversation.other_user_id}`)
    }

    // Handle delete conversation
    const handleDeleteConversation = async () => {
        if (!conversationToDelete || !profile?.id) return

        try {
            const { error } = await deleteConversation(profile.id, conversationToDelete.other_user_id)

            if (error) throw error

            // Remove from local state
            setConversations(prev =>
                prev.filter(conv => conv.other_user_id !== conversationToDelete.other_user_id)
            )

            toast.success('Conversation deleted')
        } catch (error) {
            console.error('Error deleting conversation:', error)
            toast.error('Failed to delete conversation')
        } finally {
            setConversationToDelete(null)
        }
    }

    // Load conversations
    useEffect(() => {
        if (!profile?.id) return

        const loadConversations = async () => {
            setLoading(true)
            const { data, error } = await getUserConversations(profile.id)

            if (error) {
                toast.error(
                    <div>
                        Failed to load conversations.
                        <br />
                        Please refresh the page.
                    </div>
                )
            } else if (data) {
                setConversations(data)
            }

            setLoading(false)
        }

        loadConversations()
    }, [profile?.id, isVisible])

    // Subscribe to real-time messages using centralized service
    useEffect(() => {
        let subscription = null

        const setupSubscription = async () => {
            if (!profile?.id) return

            try {
                subscription = await subscribeToPrivateMessages(profile.id, async (payload) => {
                    // Only refresh if message involves the current user
                    if (payload?.receiver_id === profile.id || payload?.sender_id === profile.id) {
                        console.log('[PRIVATE-MESSAGES] 📨 New message received, refreshing conversations')
                        const { data } = await getUserConversations(profile.id)
                        if (data) {
                            setConversations(data)
                        }
                    }
                })
            } catch (error) {
                console.error('[PRIVATE-MESSAGES] ❌ Failed to subscribe to private messages:', error)
            }
        }

        setupSubscription()

        return () => {
            if (subscription) {
                subscription.unsubscribe()
            }
        }
    }, [profile?.id])

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
            <PageTransition>
                <div className="page-container">
                    <div className="page-content">
                        <div className="loader-wrapper">
                            <ClimbingBoxLoader color="var(--color-primary)" size={20} />
                        </div>
                    </div>
                </div>
            </PageTransition>
        )
    }

    return (
        <PageTransition>
            <div className="page-container">
                <div className="page-content">
                    <div className="page-header">
                        <h2>Private Messages</h2>
                        <p className="page-subtitle">Your private conversations</p>
                    </div>

                    <div className={styles.conversationsList}>
                        {conversations.length === 0 ? (
                            <Card>
                                <CardContent>
                                    <div className={styles.emptyState}>
                                        <p className={styles.emptyText}>No conversations yet</p>
                                        <p className={styles.emptySubtext}>
                                            Start a conversation by visiting a user's profile
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            conversations.map((conv) => (
                                <Card
                                    key={conv.other_user_id}
                                    className={styles.conversationCard}
                                    hover
                                >
                                    <CardContent>
                                        <div
                                            className={styles.conversationItem}
                                            onClick={() => handleSelectConversation(conv)}
                                        >
                                            <Avatar
                                                src={conv.other_user_avatar}
                                                userId={conv.other_user_id}
                                                alt={conv.other_user_name}
                                                size="medium"
                                                fallback={(conv.other_user_name || 'U').charAt(0).toUpperCase()}
                                                showPresence={true}
                                            />
                                            <div className={styles.conversationInfo}>
                                                <div className={styles.conversationHeader}>
                                                    <h4 className={styles.conversationName}>
                                                        {conv.other_user_name || 'Unknown User'}
                                                    </h4>
                                                    {conv.unread_count > 0 && (
                                                        <span className={styles.unreadBadge}>
                                                            {conv.unread_count}
                                                        </span>
                                                    )}
                                                </div>
                                                {conv.last_message_at && (
                                                    <span className={styles.messageTime}>
                                                        {new Date(conv.last_message_at).toLocaleDateString()}
                                                    </span>
                                                )}
                                            </div>
                                            <div className={styles.messagePreview}>
                                                {conv.last_message_type === 'image' && conv.last_message_attachment ? (
                                                    <div className={styles.imagePreview}>
                                                        <img
                                                            src={conv.last_message_attachment}
                                                            alt="Last message"
                                                            className={styles.previewThumbnail}
                                                        />
                                                        <span className={styles.imageLabel}>📷 Photo</span>
                                                    </div>
                                                ) : (
                                                    <p className={styles.lastMessage}>
                                                        {conv.last_message || 'No messages yet'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            className={styles.deleteConversationBtn}
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                setConversationToDelete(conv)
                                            }}
                                            title="Delete conversation"
                                            aria-label="Delete conversation"
                                        >
                                            <TrashIcon size={8} />
                                        </button>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Confirm Delete Modal */}
            <ConfirmModal
                isOpen={!!conversationToDelete}
                onClose={() => setConversationToDelete(null)}
                onConfirm={handleDeleteConversation}
                title="Delete Conversation"
                message={`Are you sure you want to delete this entire conversation with ${conversationToDelete?.other_user_name || 'this user'}? All messages will be permanently deleted. This action cannot be undone.`}
            />
        </PageTransition>
    )
}

export default PrivateMessages
