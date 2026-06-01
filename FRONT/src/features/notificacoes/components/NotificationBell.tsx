import { Bell } from 'lucide-react'

export function NotificationBell() {
  return (
    <button className="relative p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors">
      <Bell size={20} />
    </button>
  )
}