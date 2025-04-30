import React, { forwardRef, ReactNode } from 'react'

// Mock untuk komponen Select dari shadcn/ui
interface SelectProps {
  value: string
  onValueChange: (value: string) => void
  children: ReactNode
}

export const Select = ({ value, onValueChange, children }: SelectProps) => {
  return (
    <div className="select-mock-container">
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            value,
            onChange: (e: { target: { value: string } }) =>
              onValueChange(e.target.value),
          })
        }
        return child
      })}
    </div>
  )
}

// Mock untuk komponen SelectTrigger dari shadcn/ui
interface SelectTriggerProps {
  id?: string
  className?: string
  children: ReactNode
  value?: string
  onChange?: (e: { target: { value: string } }) => void
}

export const SelectTrigger = forwardRef<HTMLSelectElement, SelectTriggerProps>(
  ({ id, className, children, value, onChange }, ref) => {
    // Ekstrak placeholder atau text dari children untuk accessibility
    let accessibleName = ''
    if (typeof children === 'string') {
      accessibleName = children
    } else if (
      React.isValidElement(children) &&
      children.props &&
      children.props.placeholder
    ) {
      accessibleName = children.props.placeholder
    } else if (id) {
      accessibleName = id
    }

    return (
      <select
        id={id}
        className={className}
        ref={ref}
        value={value}
        onChange={onChange}
        aria-label={accessibleName}
        title={accessibleName} // Tambahkan title untuk memenuhi persyaratan aksesibilitas
      >
        {children}
      </select>
    )
  }
)

SelectTrigger.displayName = 'SelectTrigger'

// Mock untuk komponen SelectContent dari shadcn/ui
interface SelectContentProps {
  className?: string
  children: ReactNode
}

export const SelectContent = ({ className, children }: SelectContentProps) => {
  return (
    <div className={`select-content-mock ${className || ''}`}>{children}</div>
  )
}

// Mock untuk komponen SelectItem dari shadcn/ui
interface SelectItemProps {
  value: string
  children: ReactNode
}

export const SelectItem = ({ value, children }: SelectItemProps) => {
  return (
    <option value={value} className="select-item-mock">
      {children}
    </option>
  )
}

// Mock untuk komponen SelectValue dari shadcn/ui
interface SelectValueProps {
  placeholder?: string
}

export const SelectValue = ({ placeholder }: SelectValueProps) => {
  return <>{placeholder}</>
}

// Mock untuk komponen Input dari shadcn/ui
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  className?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, ...props }, ref) => {
    return <input ref={ref} className={className} {...props} />
  }
)

Input.displayName = 'Input'

// Mock untuk komponen Button dari shadcn/ui
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: string
  size?: string
  className?: string
  children: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant, size, className, children, ...props }, ref) => {
    return (
      <button ref={ref} className={className} {...props}>
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'
