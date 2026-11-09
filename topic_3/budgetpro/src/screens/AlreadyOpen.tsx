import { M } from '../app/messages'

export default function AlreadyOpen() {
  return (
    <div className="fullscreen-notice">
      <div className="notice-info">{M.alreadyOpen}</div>
    </div>
  )
}
