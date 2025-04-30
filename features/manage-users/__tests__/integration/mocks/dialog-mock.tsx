import React, { ReactNode } from 'react'

interface DialogProps {
  children: ReactNode
}

interface DialogTriggerProps {
  children: ReactNode
}

interface DialogContentProps {
  children: ReactNode
}

interface DialogHeaderProps {
  children: ReactNode
}

interface DialogFooterProps {
  children: ReactNode
}

interface DialogTitleProps {
  children: ReactNode
}

interface DialogDescriptionProps {
  children: ReactNode
}

export const DialogMock = {
  Dialog: ({ children }: DialogProps) => (
    <div data-testid="dialog">{children}</div>
  ),
  DialogTrigger: ({ children }: DialogTriggerProps) => (
    <div data-testid="dialog-trigger">{children}</div>
  ),
  DialogContent: ({ children }: DialogContentProps) => (
    <div data-testid="dialog-content">{children}</div>
  ),
  DialogHeader: ({ children }: DialogHeaderProps) => (
    <div data-testid="dialog-header">{children}</div>
  ),
  DialogTitle: ({ children }: DialogTitleProps) => (
    <div data-testid="dialog-title">{children}</div>
  ),
  DialogDescription: ({ children }: DialogDescriptionProps) => (
    <div data-testid="dialog-description">{children}</div>
  ),
  DialogFooter: ({ children }: DialogFooterProps) => (
    <div data-testid="dialog-footer">{children}</div>
  ),
}

interface AlertDialogProps {
  children: ReactNode
}

interface AlertDialogTriggerProps {
  children: ReactNode
}

interface AlertDialogContentProps {
  children: ReactNode
}

interface AlertDialogHeaderProps {
  children: ReactNode
}

interface AlertDialogFooterProps {
  children: ReactNode
}

interface AlertDialogTitleProps {
  children: ReactNode
}

interface AlertDialogDescriptionProps {
  children: ReactNode
}

interface AlertDialogActionProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

interface AlertDialogCancelProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const AlertDialogMock = {
  AlertDialog: ({ children }: AlertDialogProps) => (
    <div data-testid="alert-dialog">{children}</div>
  ),
  AlertDialogTrigger: ({ children }: AlertDialogTriggerProps) => (
    <div data-testid="alert-dialog-trigger">{children}</div>
  ),
  AlertDialogContent: ({ children }: AlertDialogContentProps) => (
    <div data-testid="alert-dialog-content">{children}</div>
  ),
  AlertDialogHeader: ({ children }: AlertDialogHeaderProps) => (
    <div data-testid="alert-dialog-header">{children}</div>
  ),
  AlertDialogTitle: ({ children }: AlertDialogTitleProps) => (
    <div data-testid="alert-dialog-title">{children}</div>
  ),
  AlertDialogDescription: ({ children }: AlertDialogDescriptionProps) => (
    <div data-testid="alert-dialog-description">{children}</div>
  ),
  AlertDialogFooter: ({ children }: AlertDialogFooterProps) => (
    <div data-testid="alert-dialog-footer">{children}</div>
  ),
  AlertDialogAction: (props: AlertDialogActionProps) => (
    <button data-testid="alert-dialog-action" {...props}>
      {props.children}
    </button>
  ),
  AlertDialogCancel: (props: AlertDialogCancelProps) => (
    <button data-testid="alert-dialog-cancel" {...props}>
      {props.children}
    </button>
  ),
}
