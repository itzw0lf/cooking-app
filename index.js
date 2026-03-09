const button = document.getElementById("buttonSearch");
const sidebar = document.querySelector(".sidebar");
const historyBtn = document.getElementById("historyBtn");
const sidebarHistory = document.querySelector(".sidebar-history");

historyBtn.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});

document.querySelector(".sidebar-footer button").addEventListener("click", () => {
  localStorage.removeItem("recipes");
  loadHistory();
  document.getElementById("result").innerHTML = "";
});

function loadHistory() {
  const recipes = JSON.parse(localStorage.getItem("recipes")) || [];
  sidebarHistory.innerHTML = "";
  recipes.forEach((entry, index) => {
    const item = document.createElement("div");
    item.classList.add("history-item");
    // Support both old format (string) and new format (object with name)
    const name = typeof entry === "object" ? entry.name : "🍽️ Recipe " + (index + 1);
    const content = typeof entry === "object" ? entry.content : entry;
    item.textContent = name;
    
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "×";
    deleteBtn.style.cssText = "margin-left:auto; background:none; border:none; color:#c8853a; font-size:1.2rem; cursor:pointer; padding:0 4px; line-height:1; flex-shrink:0;";
    deleteBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const recipes = JSON.parse(localStorage.getItem("recipes")) || [];
      recipes.splice(index, 1);
      localStorage.setItem("recipes", JSON.stringify(recipes));
      loadHistory();
    });

    item.style.display = "flex";
    item.style.alignItems = "center";
    item.style.gap = "8px";
    item.appendChild(deleteBtn);
    item.addEventListener("click", () => {
      document.getElementById("result").innerHTML = content
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
            Authorization: "Bearer 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",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4o",
            messages: [
              {
                role: "user",
                content: [
                  {
                    type: "image_url",
                    image_url: { url: reader.result },
                  },
                  {
                    type: "text",
                    text: `What meals can I cook with these ingredients?\n\nAt the very END of your response, on a new line, write exactly this format (nothing else on that line):\nRECIPE_NAME: [a short creative 2-5 word name for the main dish you'd recommend]`,
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
      const fullContent = result.choices[0].message.content;

      // Extract the recipe name from the last line
      const lines = fullContent.trim().split("\n");
      const lastLine = lines[lines.length - 1];
      let recipeName = "🍽️ New Recipe";
      let content = fullContent;

      if (lastLine.startsWith("RECIPE_NAME:")) {
        recipeName = "🍽️ " + lastLine.replace("RECIPE_NAME:", "").trim();
        content = lines.slice(0, -1).join("\n").trim();
      }

      const recipes = JSON.parse(localStorage.getItem("recipes")) || [];
      recipes.push({ name: recipeName, content: content });
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