import { openai } from "./OpenAi";

const speak = async (input: string) => {
  try {
    const response = await openai.audio.speech.create({
      model: "tts-1",
      voice: "alloy",
      input,
    });

    if (response.body) {
      // Stream the response directly to a Blob
      const reader = response.body.getReader();
      const stream = new ReadableStream({
        async start(controller) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
          }
          controller.close();
          reader.releaseLock();
        },
      });

      // Convert the ReadableStream into a Blob
      const blob = await new Response(stream).blob();
      const audioUrl = URL.createObjectURL(blob);

      // Create an audio element and play it
      const audio = new Audio(audioUrl);
      audio.play();
    } else {
      console.error(
        "Audio streaming not supported or no response stream available."
      );
    }
  } catch (error) {
    console.error("Failed to fetch TTS audio:", error);
  }
};

export default speak;
