# MBA Policy Assistant

A grounded AI policy intelligence assistant for Georgetown University MBA students, faculty, and academic advisors. The assistant answers inquiries regarding academic standing, core course attendance caps, leaves of absence, grading, and Honor Council procedures by retrieving verified passages directly from official policy documents.

---

## How It Works

The system implements a complete two-phase **Retrieval-Augmented Generation (RAG)** pipeline:

1. **Index Once (Notebook)**: `Lab 3 - Build a Policy Search Store.ipynb` processes official MBA policy PDFs, splits them into semantic chunks with overlap, generates vector embeddings, and stores them in a persistent **Gemini API File Search Store**.
2. **Query Real-Time (Web App)**: The web app sends user questions to Gemini 3.5 Flash using `@google/genai` with the `fileSearch` tool attached. The model grounds its answers strictly in the retrieved passages and cites the exact document title, page number, and text excerpt.

---

## Setup Guide for Google AI Studio

Follow these six steps to deploy and run your own instance in Google AI Studio:

### Step 1: Fork the Repository
1. On GitHub, click the **Fork** button at the top-right of the repository.
2. Select your personal GitHub account to create your fork.

---

### Step 2: Pull into Google AI Studio
1. Navigate to [Google AI Studio](https://aistudio.google.com/).
2. In the navigation menu, select **Build** (or **New App**).
3. Choose **Import from GitHub** and select your forked repository.
4. AI Studio will load the codebase into an interactive development workspace.

---

### Step 3: Configure Your API Key in the Notebook
1. Open the included Jupyter Notebook: [`Lab 3 - Build a Policy Search Store.ipynb`](./Lab%203%20-%20Build%20a%20Policy%20Search%20Store.ipynb) (you can open and run it directly in [Google Colab](https://colab.research.google.com/)).
2. Generate an API key at [aistudio.google.com/apikey](https://aistudio.google.com/apikey).
   > **Important Note on Projects:** Take note of the **Google Cloud Project** associated with your API key. The File Search store lives inside that project. The web app in Google AI Studio must use an API key from the **exact same project** to access the store.
3. In Google Colab:
   - Click the **Secrets** icon (the key symbol) in the left sidebar.
   - Add a new secret with Name: `AI_STUDIO_API_KEY` and Value: paste your Gemini API key.
   - Toggle **Notebook access** ON.

---

### Step 4: Run the Notebook to Build the Document Store
1. In Colab, run **Section 3: Upload the policy PDFs**. When prompted by the file picker, upload the Georgetown MBA policy files:
   - `MBA Student Handbook 2026-2027 v2.docx.pdf`
   - `MBA Student Syllabus Policies 2026-2027.pdf`
   - `Artificial Intelligence (AI) Use Policy- MBA Program.pdf`
2. Run **Section 4: Create a File Search store**. The cell outputs your unique store identifier:
   ```text
   Created: fileSearchStores/mbapolicies-your-unique-id
   ```
   **Copy this store name**—you will connect it to the web app in the next step.
3. Run **Section 5: Add the PDFs to the store**. The notebook chunks (200 tokens/chunk, 20-token overlap), embeds, and indexes each PDF into the store.
4. (Optional) Run Sections 6 and 7 to test a sample question in Python and verify that citations and pages are returned.

---

### Step 5: Configure Google AI Studio to Access Your Store
1. **Set the API Key in AI Studio**:
   - In Google AI Studio, open the **Settings > Secrets** panel in the top header.
   - Select or add your project's billing-enabled Gemini API key (the one from the same Google Cloud project used in Step 3).
2. **Set the Store Name in the Web App**:
   - If your store name matches `fileSearchStores/mbapolicies-ldjpw9byydqw`, no code change is required.
   - If the notebook generated a different store identifier, update it in one of two ways:
     - **Option A (Environment Variable)**: Set `FILE_SEARCH_STORE_NAME="fileSearchStores/your-store-id"` in your project environment or `.env`.
     - **Option B (Code)**: In `server.ts`, update the store identifier:
       ```ts
       const GEORGETOWN_MBA_FILE_SEARCH_STORE =
         process.env.FILE_SEARCH_STORE_NAME || 'fileSearchStores/your-store-id';
       ```

---

### Step 6: Run the App and Ask Questions
1. In the Google AI Studio terminal, start the development server:
   ```bash
   npm run dev
   ```
2. The web interface will load on port `3000` with the **MBA Policy Assistant**.
3. Test with common Georgetown MBA policy inquiries:
   - *"What is the minimum GPA required for good academic standing?"*
   - *"What is the attendance policy for required MBA core courses?"*
   - *"What is the procedure for requesting a formal leave of absence?"*
   - *"What are the criteria for graduation with academic honors?"*
4. Review the results:
   - **Answer**: Direct policy response formatted in readable markdown.
   - **Sources List**: Directly below the answer, inspecting each cited chunk with its document title, page number, and 300-character text snippet.
   - **Policy Boundaries**: If you ask an uncovered question (e.g., *"What is the recipe for cookies?"*), the assistant states plainly that the policies do not cover it, and shows:
     > *"No policy passages were retrieved for this question."*

---

## Technical Stack

- **Frontend**: React 19, Tailwind CSS (Georgetown Hoyas Blue `#041E42` and Hoyas Gray `#63666A`), Lucide React
- **Backend API**: Node.js, Express, Vite middleware mode (`server.ts`)
- **AI & RAG Engine**: `@google/genai` TypeScript SDK
  - **Model**: `gemini-3.5-flash`
  - **Tool**: `fileSearch` with `fileSearchStoreNames`
  - **Grounding**: Extracts `response.candidates[0].groundingMetadata.groundingChunks`

---

## Common Troubleshooting

| Issue | Cause | Solution |
| :--- | :--- | :--- |
| **`403 PERMISSION_DENIED`** | The API key in AI Studio belongs to a different project than the one that created the File Search store. | Go to **Settings > Secrets** in AI Studio and select the API key from the same Google Cloud project used in Colab. |
| **`404 NOT_FOUND` (Store)** | The store name has a typo or was deleted. | Double-check the store name output from Step 4 of the notebook and ensure `FILE_SEARCH_STORE_NAME` in `server.ts` matches. |
| **Missing citations** | The query didn't match any policy text or was out of scope. | Normal behavior. The app will state that policies do not cover the question and show *"No policy passages were retrieved for this question."* |
