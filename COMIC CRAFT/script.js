// ======================================================
// GEMINI API KEY
// ======================================================

// Replace this with your real Gemini API key.
const API_KEY = "YOUR_COMPLETE_KEY_HERE";



// ======================================================
// GENERATE COMIC
// ======================================================

async function generateComic() {

    const storyInput = document.getElementById("storyInput");
    const loading = document.getElementById("loading");
    const comicContainer = document.getElementById("comicContainer");

    const idea = storyInput.value.trim();

    // Check story idea
    if (!idea) {
        alert("Please enter a story idea!");
        return;
    }

    // Check API key
    if (!API_KEY || API_KEY === "YOUR_GEMINI_API_KEY") {

        comicContainer.innerHTML = `
            <div class="error">
                ❌ Please add your Gemini API key in script.js.
            </div>
        `;

        return;
    }

    // Show loading
    loading.style.display = "block";

    comicContainer.innerHTML = "";

    const prompt = `
You are an AI comic story creator.

Create a fun and simple 4-panel comic story based on this idea:

"${idea}"

Return ONLY valid JSON.

Use exactly this format:

{
    "title": "Comic Title",
    "panels": [
        {
            "scene": "Description of what happens in panel 1",
            "dialogue": "Short character dialogue"
        },
        {
            "scene": "Description of what happens in panel 2",
            "dialogue": "Short character dialogue"
        },
        {
            "scene": "Description of what happens in panel 3",
            "dialogue": "Short character dialogue"
        },
        {
            "scene": "Description of what happens in panel 4",
            "dialogue": "Short character dialogue"
        }
    ]
}

Rules:
- Exactly 4 panels.
- Make the story exciting and easy to understand.
- Use simple English.
- Keep dialogue short.
- Suitable for students.
- Do not use Markdown.
- Return JSON only.
`;

    try {

        // ==================================================
        // SEND REQUEST TO GEMINI
        // ==================================================

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
            encodeURIComponent(API_KEY),

            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ],

                    generationConfig: {
                        temperature: 0.8,
                        responseMimeType: "application/json"
                    }
                })
            }
        );


        // ==================================================
        // READ RESPONSE
        // ==================================================

        const data = await response.json();

        console.log("Gemini response:", data);


        // ==================================================
        // HANDLE API ERROR
        // ==================================================

        if (!response.ok) {

            const errorMessage =
                data?.error?.message ||
                "Gemini API request failed.";

            throw new Error(errorMessage);
        }


        // ==================================================
        // GET GENERATED TEXT
        // ==================================================

        const result =
            data?.candidates?.[0]?.content?.parts?.[0]?.text;


        if (!result) {
            throw new Error(
                "Gemini did not return a comic story."
            );
        }


        // ==================================================
        // CONVERT RESPONSE TO JSON
        // ==================================================

        let comic;

        try {

            comic = JSON.parse(result);

        } catch (jsonError) {

            console.error("Invalid JSON from Gemini:", result);

            throw new Error(
                "Gemini returned an invalid comic format."
            );
        }


        // ==================================================
        // CHECK COMIC DATA
        // ==================================================

        if (!comic.title || !Array.isArray(comic.panels)) {

            throw new Error(
                "The generated comic has an invalid format."
            );
        }


        // ==================================================
        // DISPLAY COMIC
        // ==================================================

        displayComic(comic);

    }

    catch (error) {

        console.error("Comic generation error:", error);

        comicContainer.innerHTML = `
            <div class="error">
                ❌ ${escapeHTML(error.message)}
            </div>
        `;

    }

    finally {

        loading.style.display = "none";
    }
}


// ======================================================
// DISPLAY COMIC
// ======================================================

function displayComic(comic) {

    const container =
        document.getElementById("comicContainer");


    // Comic title
    container.innerHTML = `
        <div class="comic">

            <h2>
                📖 ${escapeHTML(comic.title)}
            </h2>

            <div class="panel-grid"></div>

        </div>
    `;


    const panelGrid =
        container.querySelector(".panel-grid");


    // Create panels
    comic.panels.forEach((panel, index) => {

        const div =
            document.createElement("div");

        div.className = "panel";


        div.innerHTML = `
            <div class="panel-header">
                Panel ${index + 1}
            </div>

            <div class="scene">

                <h4>🎬 Scene</h4>

                <p>
                    ${escapeHTML(panel.scene)}
                </p>

            </div>

            <div class="dialogues">

                <div class="speech">

                    <strong>💬 Dialogue</strong>

                    <p>
                        "${escapeHTML(panel.dialogue)}"
                    </p>

                </div>

            </div>
        `;


        panelGrid.appendChild(div);
    });
}


// ======================================================
// ESCAPE HTML
// ======================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}
