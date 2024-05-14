import {
  Button,
  ButtonProps,
  Flex,
  FlexProps,
  Heading,
  HeadingProps,
  IconButton,
  IconButtonProps,
  useColorModeValue,
  useBreakpointValue,
} from "@chakra-ui/react";

export const ColumnHeader = (props: FlexProps) => (
  <Flex
    minH="12"
    position="sticky"
    zIndex={1}
    top="0"
    px="3"
    align="center"
    bg={useColorModeValue("white", "gray.800")}
    color={useColorModeValue("gray.700", "white")}
    {...props}
  />
);

export const ColumnHeading = (props: HeadingProps) => {
  const isTruncated = useBreakpointValue({ base: true, md: false });
  return (
    <Heading
      isTruncated={isTruncated}
      noOfLines={isTruncated ? 1 : undefined}
      fontWeight="bold"
      fontSize="sm"
      lineHeight="1.25rem"
      {...props}
    />
  );
};

export const ColumnButton = (props: ButtonProps) => (
  <Button
    variant="tertiary"
    size="sm"
    fontSize="xs"
    _hover={{ bg: useColorModeValue("gray.100", "gray.700") }}
    _active={{ bg: useColorModeValue("gray.200", "gray.600") }}
    _focus={{ boxShadow: "none" }}
    _focusVisible={{ boxShadow: "outline" }}
    {...props}
  />
);

export const ColumnIconButton = (props: IconButtonProps) => (
  <IconButton
    size="sm"
    fontSize="md"
    variant="tertiary"
    _hover={{ bg: useColorModeValue("gray.100", "gray.700") }}
    _active={{ bg: useColorModeValue("gray.200", "gray.600") }}
    _focus={{ boxShadow: "none" }}
    _focusVisible={{ boxShadow: "outline" }}
    {...props}
  />
);
