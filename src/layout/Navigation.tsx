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
  FiDatabase,
  FiGithub,
  FiShoppingCart,
  FiCalendar,
  FiMessageCircle,
  FiX,
  FiBook,
  FiCode,
} from "react-icons/fi";

import { ColumnHeader, ColumnIconButton } from "./Column";
import { ColorModeSwitcher } from "./ColorModeSwitcher";
import { useKitchen } from "../KitchenContext"; // Update import path if necessary

interface NavbarProps extends FlexProps {
  onClose?: () => void;
}

export const Navbar = (props: NavbarProps) => {
  const { selectedNav, handleNavSelection } = useKitchen(); // Destructure the necessary state and functions from context

  const Hunger = mode(
    () => <>🍐</>,
    () => <>🍖</>
  );

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
              <Hunger /> Omnivore
            </Text>
          </HStack>
        </ColumnHeader>

        <Stack px="3" spacing="6" justify={"space-between"}>
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
              icon={FiShoppingCart}
            >
              Shopping
            </NavLink>
            <NavLink
              onClick={() => handleNavSelection("Meal plan")}
              aria-current={selectedNav === "Meal plan" ? "page" : false}
              icon={FiCalendar}
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
              {/* <NavLink
                icon={FiGithub}
                isExternal
                href={`https://github.com/joshuacrowley/omnivore`}
              >
                GitHub
              </NavLink>
              <NavLink
                icon={FiCode}
                isExternal
                href={`https://platform.openai.com/docs/introduction`}
              >
                OpenAI Docs
              </NavLink> */}

              <NavLink
                icon={FiDatabase}
                isExternal
                href={`https://airtable.com/${process.env.REACT_APP_AIRTABLE_BASE}`}
                target={"_top"}
              >
                Airtable
              </NavLink>
              {/* <NavLink
                icon={FiBook}
                isExternal
                href={`https://airtable.com/${process.env.REACT_APP_AIRTABLE_BASE}/api/docs`}
                target={"_top"}
              >
                Airtable API
              </NavLink> */}
            </Stack>
          </Stack>
        </Stack>
      </Stack>
      <ColorModeSwitcher />
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
        <HStack spacing="3">
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
