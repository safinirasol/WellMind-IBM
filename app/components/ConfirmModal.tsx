"use client"
import React from 'react'

interface ConfirmModalProps {
  isOpen: boolean
  title: string
  message: string
  actionLabel?: string
  cancelLabel?: string
  isDangerous?: boolean
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  actionLabel = 'Confirm',
  cancelLabel = 'Cancel',
  isDangerous = false,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-2xl max-w-sm mx-4 p-6 animate-in fade-in zoom-in duration-300">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
            isDangerous ? 'bg-red-100' : 'bg-blue-100'
          }`}>
            {isDangerous ? (
              <svg className="w-6 h-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
            <p className="text-sm text-gray-600 mt-2">{message}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3 justify-end">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition disabled:opacity-50 ${
              isDangerous
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? 'Processing...' : actionLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
