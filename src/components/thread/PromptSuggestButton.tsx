import { Box, HStack, Stack, Text, Tooltip } from '@chakra-ui/react'

interface Props {
  icon: React.ReactElement
  title: string
  description: string
  onClick?: VoidFunction
}

export const PromptSuggestButton = (props: Props) => {
  const { icon, title, description, onClick } = props
  return (
    <Tooltip label="Click to send" rounded="md" placement="top">
      <Stack
        data-group
        as="button"
        bg="bg.surface"
        borderWidth="1px"
        rounded="md"
        spacing="0"
        px="4"
        py="2"
        type="button"
        fontSize="sm"
        onClick={onClick}
      >
        <HStack>
          <Box color="accent">{icon}</Box>
          <Text align="start" fontWeight="medium" _groupHover={{ color: 'accent' }}>
            {title}
          </Text>
        </HStack>
        <Text align="start" color="fg.muted">
          {description}
        </Text>
      </Stack>
    </Tooltip>
  )
}
