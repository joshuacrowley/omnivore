interface Users {
  [key: string]: {
    name: string;
    image: string;
  };
}

interface Chat {
  type: "user" | "assistant";
  messages: string[];
}

export const users: Users = {
  user: {
    name: "You",
    image:
      "https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dXNlcnxlbnwwfHwwfHx8MA%3D%3D",
  },
  assistant: {
    name: "GPT",
    image:
      "https://images.unsplash.com/photo-1577563908411-5077b6dc7624?w=700&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Ym90fGVufDB8fDB8fHww",
  },
};

export const chats: Chat[] = [
  {
    type: "user",
    messages: [`What is Chakra UI and how does it work?`],
  },
  {
    type: "assistant",
    messages: [
      `Chakra UI is a popular open-source React component library that provides a set of flexible and accessible UI components for building modern web applications. It is designed to make it easier for developers to create consistent and visually appealing user interfaces with minimal effort.`,
    ],
  },
  {
    type: "user",
    messages: [`How is it different from Chakra UI Pro?`],
  },
  {
    type: "assistant",
    messages: [
      `Chakra UI is a React component library that provides a set of flexible and accessible UI components for building modern web applications. It is designed to make it easier for developers to create consistent and visually appealing user interfaces with minimal effort.`,
      `Chakra UI Pro provides over 180+ beautifully designed components, made by the creators of Chakra UI. The perfect starting line for your next project.      `,
    ],
  },
];
