import { Textarea, TextareaProps } from '@chakra-ui/react'

export const ChatTextarea = (props: TextareaProps) => {
  return (
    <Textarea
      name="message"
      placeholder="Ask me anything..."
      maxHeight="200px"
      paddingEnd="9"
      resize="none"
      rows={2}
      {...props}
      _placeholder={{ color: 'fg.subtle' }}
      onInput={(event) => {
        const textarea = event.currentTarget
        textarea.style.height = 'auto'
        const borderHeight = textarea.offsetHeight - textarea.clientHeight
        textarea.style.height = textarea.scrollHeight + borderHeight + 'px'
        props.onInput?.(event)
      }}
    />
  )
}
