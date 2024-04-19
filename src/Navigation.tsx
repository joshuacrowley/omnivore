import {
  As,
  Box,
  Button,
  ButtonProps,
  Flex,
  FlexProps,
  HStack,
  Icon,
  Link,
  LinkProps,
  Stack,
  Text,
  TextProps,
  useColorModeValue as mode,
} from "@chakra-ui/react";
import {
  FiArrowUpRight,
  FiBookOpen,
  FiBookmark,
  FiCamera,
  FiFigma,
  FiFilm,
  FiGithub,
  FiHome,
  FiMessageCircle,
  FiMessageSquare,
  FiMic,
  FiShield,
  FiTwitter,
  FiX,
} from "react-icons/fi";
import { ColumnHeader, ColumnIconButton } from "./Column";
import { useRecipe } from "./KitchenContext"; // Update import path if necessary

interface NavbarProps extends FlexProps {
  onClose?: () => void;
}

export const Navbar = (props: NavbarProps) => {
  const { selectedNav, handleNavSelection } = useRecipe(); // Destructure the necessary state and functions from context

  return (
    <Flex
      as="nav"
      height="full"
      direction="column"
      justify="space-between"
      {...props}
    >
      <Stack spacing="3">
        <ColumnHeader>
          <HStack spacing="3">
            <ColumnIconButton
              onClick={props.onClose}
              aria-label="Close navigation"
              icon={<FiX />}
              display={{ base: "inline-flex", lg: "none" }}
            />
            <Text fontWeight="bold" fontSize="sm" lineHeight="1.25rem">
              Cookbook Kitchen
            </Text>
          </HStack>
        </ColumnHeader>

        <Stack px="3" spacing="6">
          <Stack spacing="1">
            <NavLink
              onClick={() => handleNavSelection("Recipes")}
              icon={FiBookOpen}
              aria-current={selectedNav === "Recipes" ? "page" : false}
            >
              Recipes
            </NavLink>
            <NavLink
              onClick={() => handleNavSelection("Shopping")}
              aria-current={selectedNav === "Shopping" ? "page" : false}
              icon={FiBookmark}
            >
              Shopping
            </NavLink>
            <NavLink
              onClick={() => handleNavSelection("Meal plan")}
              aria-current={selectedNav === "Meal plan" ? "page" : false}
              icon={FiCamera}
            >
              Meal plan
            </NavLink>
            <NavLink
              onClick={() => handleNavSelection("Chat")}
              aria-current={selectedNav === "Chat" ? "page" : false}
              icon={FiMessageCircle}
            >
              Chat
            </NavLink>
          </Stack>

          <Stack spacing="3">
            <NavHeading>Help</NavHeading>
            <Stack spacing="1">
              <NavLink icon={FiGithub} isExternal>
                GitHub
              </NavLink>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Flex>
  );
};

const NavButton = (props: ButtonProps) => (
  <Button
    width="full"
    borderRadius="0"
    variant="tertiary"
    size="lg"
    fontSize="sm"
    _hover={{ bg: mode("gray.100", "gray.700") }}
    _active={{ bg: mode("gray.200", "gray.600") }}
    _focus={{ boxShadow: "none" }}
    _focusVisible={{ boxShadow: "outline" }}
    {...props}
  />
);

interface NavLinkProps extends LinkProps {
  icon: As;
}

export const NavLink = (props: NavLinkProps) => {
  const { icon, ...linkProps } = props;
  return (
    <Link
      px="2"
      py="1.5"
      borderRadius="md"
      _hover={{ bg: mode("gray.100", "gray.700") }}
      _activeLink={{
        bg: "gray.700",
        color: "white",
      }}
      {...linkProps}
    >
      <HStack justify="space-between">
        <HStack as="a" spacing="3">
          <Icon as={icon} />
          <Text as="span" fontSize="sm" lineHeight="1.25rem">
            {props.children}
          </Text>
        </HStack>
        {props.isExternal && (
          <Icon
            as={FiArrowUpRight}
            boxSize="4"
            color={mode("gray.600", "gray.400")}
          />
        )}
      </HStack>
    </Link>
  );
};

export const NavHeading = (props: TextProps) => (
  <Text
    as="h4"
    fontSize="xs"
    fontWeight="semibold"
    px="2"
    lineHeight="1.25"
    color={mode("gray.600", "gray.400")}
    {...props}
  />
);
