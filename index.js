const button = document.getElementById("buttonSearch");
const sidebar = document.querySelector(".sidebar");
const historyBtn = document.getElementById("historyBtn");
const sidebarHistory = document.querySelector(".sidebar-history");

historyBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

function loadHistory() {
  const recipes = JSON.parse(localStorage.getItem("recipes")) || [];
  sidebarHistory.innerHTML = "";
  recipes.forEach((recipe, index) => {
    const item = document.createElement("div");
    item.classList.add("history-item");
    item.textContent = "🍽️ Recipe " + (index + 1);
    item.addEventListener("click", () => {
      document.getElementById("result").innerHTML = recipe
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replaceAll("*", " ")
        .replaceAll("\n", "<br>");
    });
    sidebarHistory.appendChild(item);
  });
}

loadHistory();

button.addEventListener("click", () => {
  const file = document.getElementById("fileInput").files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async () => {
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
      i = (i + 1) % loadingMessage.length;
    }, 500);

    try {
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: "Bearer YOUR_KEY_HERE",
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
                    image_url: { url: reader.result },
                  },
                ],
              },
            ],
            max_tokens: 1000,
          }),
        }
      );

      clearInterval(interval);
      const result = await response.json();
      const content = result.choices[0].message.content;

      const recipes = JSON.parse(localStorage.getItem("recipes")) || [];
      recipes.push(content);
      localStorage.setItem("recipes", JSON.stringify(recipes));
      loadHistory();

      document.getElementById("result").innerHTML = content
        .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>")
        .replaceAll("*", " ")
        .replaceAll("\n", "<br>");
    } catch (error) {
      clearInterval(interval);
      document.getElementById("result").innerHTML =
        "Sorry something went wrong, try again later!";
    }
  };

  reader.readAsDataURL(file);
});