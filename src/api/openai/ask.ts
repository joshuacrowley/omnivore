import { openai } from "./OpenAi";

async function ask(question: string, questionContext: string) {
  console.log("question", question);

  console.log("questionContext", questionContext);

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo",
    messages: [
      {
        role: "system",
        content: `You are about to be asked a question about the proceeding text. Please respond with a short response.
                 text: ${questionContext}`,
      },
      {
        role: "user",
        content: question,
      },
    ],
  });

  console.log("answer:", response.choices[0].message.content);

  return response.choices[0].message.content; // Assuming the structure contains a 'message' with 'content'
}

export { ask };
