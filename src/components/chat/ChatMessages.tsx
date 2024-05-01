import { Box, Stack, StackDivider, StackProps } from '@chakra-ui/react'

export const ChatMessages = (props: StackProps) => {
  return (
    <Stack
      maxW="prose"
      mx="auto"
      paddingX={{ base: '4', md: '0' }}
      divider={
        <Box marginLeft="14!">
          <StackDivider />
        </Box>
      }
      spacing="10"
      {...props}
    />
  )
}
