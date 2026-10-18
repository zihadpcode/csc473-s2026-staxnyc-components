import { useEffect, useRef } from 'react'
export default function Dialog({ title, children, onClose }) {
  const dialog = useRef(null)
  useEffect(() => {
    const previous = document.activeElement
    dialog.current.showModal()
    return () => {
      dialog.current?.close()
      previous?.focus?.()
    }
  }, [])
  return (
    <dialog
      className="stax-dialog"
      ref={dialog}
      aria-label={title}
      onCancel={(event) => {
        event.preventDefault()
        onClose()
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="dialog-heading">
        <h2>{title}</h2>
        <button
          className="btn-ghost"
          aria-label="Close dialog"
          onClick={onClose}
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  )
}
