const button = document.getElementById("buttonSearch");
button.addEventListener("click", () => {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result.split(",")[1];
    console.log(base64);
    const loadingMessage = [
      "Our chef is thinking.",
      "Our chef is thinking..",
      "Our chef is thinking...",
      "Whisking up ideas.",
      "Whisking up ideas..",
      "Whisking up ideas...",
      "Sharpening the virtual knives.",
      "Sharpening the virtual knives..",
      "Sharpening the virtual knives...",
      "Mixing and matching flavors.",
      "Mixing and matching flavors..",
      "Mixing and matching flavors...",
    ];

    let i = 0;
    const interval = setInterval(() => {
      document.getElementById("result").innerHTML = loadingMessage[i];
      i++;
      if (i >= loadingMessage.length) {
        i = 0;
      }
    }, 500);

    try {
      const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization:
            "Bearer key",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: "What meals can I cook with these ingredients?",
                },

                {
                  type: "image_url",
                  image_url: {
                    url: reader.result,
                  },
                },
              ],
            },
          ],
          max_tokens: 1000,
        }),
      },
    );
    clearInterval(interval);
    const result = await response.json();
    console.log(result);
    document.getElementById("result").innerHTML =
      result.choices[0].message.content
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replaceAll("*", " ")
        .replaceAll("\n", "<br>");
    } catch (error) {
      clearInterval(interval);
      document.getElementById("result").innerHTML = 'Sorry something went wrong, try again later!'
    }
  };

  reader.readAsDataURL(file);
});
