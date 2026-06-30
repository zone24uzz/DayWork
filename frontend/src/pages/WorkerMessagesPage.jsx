import { useEffect } from 'react'
import ChatPage from './ChatPage'

const WorkerMessagesPage = () => {
  useEffect(() => {
    document.title = 'DayWork — Xabarlar (Ishchi)'
  }, [])

  return <ChatPage role="worker" />
}

export default WorkerMessagesPage
