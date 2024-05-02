import { Center, Circle, Icon, Text } from '@chakra-ui/react'
import { FiMic } from 'react-icons/fi'

export const EmptyStatePrompt = (props: React.PropsWithChildren) => {
  const { children } = props
  return (
    <Center height="full" gap="6">
      <Circle
        bg="bg.accent.default"
        color="fg.default"
        size="12"
        outline="8px solid"
        outlineColor="fg.accent.subtle"
      >
        <Icon as={FiMic} color="fg.inverted" />
      </Circle>
      <Text fontSize="xl" color="fg.muted" fontWeight="medium">
        {children}
      </Text>
    </Center>
  )
}
