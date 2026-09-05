# Gemini and LM Studio

1. Extract the whole ZIP. Gemini works through the existing index page on GitHub Pages.
2. For local use on Windows with Python installed, double-click start-local.bat. It opens http://localhost:8080. Keep that window open. Alternatively run python serve-local.py.
3. In LM Studio, load your downloaded instruction-tuned model. Start the server from Developer. Enable CORS in server settings. Leave network serving off when using the same notebook.
4. Open index.html through the server, enter Katie, and choose AI setup → LM Studio. Default address: http://localhost:1234/v1. If server authentication is enabled, enter its token under the optional authentication section. Gemini keys are never sent to LM Studio.
5. Click Connect & list models, select the exact model, then Test model. The test checks a simple structured JSON response, not SAT-level accuracy. Save on this computer.
6. Open Test 1, select level and count, and generate. Each local question gets a second model answer-check pass. Both passes can still be wrong. Failed checks prevent saving the set. Local generation can take several minutes. Cancel remains available.

Use a modest context (start around 8,192 if 4,096 is too small for prompts plus output), close unused applications, and choose a small quantized model. Local output is limited to 2,048 tokens per request with a five-minute timeout.

GitHub Pages cannot run LM Studio itself. Each student needs a reachable server; localhost means the student's own computer. Browser local-network permission and CORS may be needed. If the HTTPS page cannot connect, use the localhost launcher. Keys and progress are browser/origin-specific: localhost and GitHub Pages have separate storage. Use existing backup/export tools to move progress.

Switch to Gemini in AI setup to use the saved cloud keys again. No automatic switching between local and cloud providers; Gemini still automatically uses API 2 after eligible API 1 errors.

Official documentation: https://lmstudio.ai/docs/developer/openai-compat/structured-output and https://lmstudio.ai/docs/developer/core/server/settings
