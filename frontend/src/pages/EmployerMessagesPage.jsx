import { useEffect } from 'react'
import ChatPage from './ChatPage'

const EmployerMessagesPage = () => {
  useEffect(() => {
    document.title = 'DayWork — Xabarlar (Ish beruvchi)'
  }, [])

  return <ChatPage role="employer" />
}

export default EmployerMessagesPage
