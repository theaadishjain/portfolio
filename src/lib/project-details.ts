/**
 * Long-form content for the per-project pages.
 *
 * Everything factual here was read out of the repositories themselves —
 * chunk sizes, vector dimensions, routing tiers, dependency versions — rather
 * than summarised from the card copy. Where a project has no public repo the
 * claims stay deliberately narrow.
 */

export type DiagramKind = 'stack' | 'pipeline' | 'branch';

export interface DiagramNode {
  label: string;
  note?: string;
}

export interface DiagramLayer {
  /** Short uppercase band label, e.g. "AGENTS". */
  title: string;
  nodes: DiagramNode[];
  /** Label for the arrow leaving this layer downward. */
  flow?: string;
}

export interface DiagramStep {
  label: string;
  note?: string;
}

export interface DiagramBranch {
  /** The condition on the edge. */
  condition: string;
  label: string;
  note?: string;
  /** Drives the ink colour: hottest path first. */
  tone?: 'alarm' | 'warn' | 'calm';
}

export interface Architecture {
  kind: DiagramKind;
  caption: string;
  layers?: DiagramLayer[];
  steps?: DiagramStep[];
  root?: string;
  rootNote?: string;
  branches?: DiagramBranch[];
  footnote?: string;
}

export interface Decision {
  title: string;
  body: string;
}

export interface Metric {
  value: string;
  label: string;
}

export interface StackGroup {
  group: string;
  items: string[];
}

export interface ProjectDetail {
  slug: string;
  caseNo: string;
  /** Handwritten line under the title. */
  tagline: string;
  lede: string;
  problem: string;
  role: string;
  timeline: string;
  status: string;
  metrics: Metric[];
  architecture: Architecture;
  decisions: Decision[];
  features: string[];
  stack: StackGroup[];
  /** Caveat-font asides pinned into the margin. */
  marginNotes: string[];
  /** Shown as an honest "what I'd change" note. */
  candid?: string;
  /** Explains an absent repo or live link. */
  repoNote?: string;
}

export const PROJECT_DETAILS: ProjectDetail[] = [
  // ───────────────────────────────────────────────────────────── Athena ─────
  {
    slug: 'athena',
    caseNo: '01',
    tagline: 'six specialists, one chat box',
    lede:
      "Athena is a study assistant meant to replace the four or five tools a student ends up juggling during exam week. You type one sentence. A coordinator works out what you actually need and hands it to whichever agent does that job: a planner for schedules, a summariser for lecture PDFs, a flashcard generator, a quiz setter, or an advisor for everything else.",
    problem:
      "Most chat assistants forget you the moment you close the tab. They also make you pick your tool before you have described your problem. Someone three days out from an exam shouldn't have to know they want \"a study plan\" rather than just help. Athena takes the sentence as written and works it out from there.",
    role: 'Solo build. Architecture, agents, frontend, deploy.',
    timeline: 'Apr 2026 – Jul 2026',
    status: 'Live, still being worked on',
    metrics: [
      { value: '6', label: 'specialist agents behind one endpoint' },
      { value: '13', label: 'API routes, all but /health JWT-guarded' },
      { value: 'top-3', label: 'memory chunks pulled in per request' },
      { value: 'SSE', label: 'answers stream token by token' },
    ],
    architecture: {
      kind: 'stack',
      caption:
        'Four layers. A request comes in as plain text and leaves as a typed envelope, and every agent reads and writes the same memory on the way through.',
      layers: [
        {
          title: 'Client',
          nodes: [
            { label: 'Chat' },
            { label: 'Notes' },
            { label: 'Flashcards' },
            { label: 'Study plan' },
            { label: 'Dashboard' },
          ],
          flow: 'SSE / REST  ·  Bearer JWT',
        },
        {
          title: 'API',
          nodes: [
            { label: 'FastAPI' },
            { label: '/chat', note: 'streams' },
            { label: '/summarize', note: 'multipart' },
            { label: '/sessions' },
            { label: '/memory' },
          ],
          flow: 'AcademicState',
        },
        {
          title: 'Agents',
          nodes: [
            { label: 'Coordinator', note: 'router' },
            { label: 'Advisor' },
            { label: 'Planner' },
            { label: 'Summarizer' },
            { label: 'Flashcard' },
            { label: 'Quiz' },
          ],
          flow: 'read top-k  ↕  write',
        },
        {
          title: 'Memory',
          nodes: [
            { label: 'ChromaDB', note: 'vectors' },
            { label: 'MemPalace' },
            { label: 'SQLite', note: 'sessions' },
          ],
        },
      ],
      footnote:
        'Gemini 2.5 Flash runs behind the agent executor through OpenRouter. Memory is namespaced by Clerk user id, so retrieval only ever sees one student.',
    },
    decisions: [
      {
        title: 'Everything goes through one endpoint',
        body:
          "Every request hits POST /chat, whatever it happens to be asking for, and the coordinator reads intent and dispatches from there. I could have given each agent its own route. That would have been less code. But then the user has to classify their own question before they are allowed to ask it, which felt like the wrong way round.",
      },
      {
        title: 'Agents read all the memory, write only their own',
        body:
          "Six agents sharing one vector store will turn it into a landfill if they can all write anywhere. So each one owns specific namespaces. The advisor and planner append to past_chats and preferences. The summariser owns note_summaries and weak_subjects. Reads stay open to everyone.",
      },
      {
        title: 'Identity comes from the token and nowhere else',
        body:
          "Protected routes resolve the user from the Clerk JWT, never from a field in the request body. That's the bit that makes the memory namespacing hold up. There's no id a client could swap out to go reading somebody else's history.",
      },
      {
        title: 'SSE rather than WebSockets',
        body:
          'Streaming here only goes one direction. Tokens come out, nothing goes back mid-response. SSE is plain HTTP, it survives proxies, and it reconnects on its own, so I didn\'t take on a socket lifecycle for a feature that never needed two-way traffic.',
      },
      {
        title: 'One response shape for all six agents',
        body:
          'A single UnifiedResponse carries the status, which agent handled it, the text, and optional flashcard or quiz arrays. The frontend parses one thing instead of six. Adding a seventh agent wouldn\'t touch the client at all.',
      },
    ],
    features: [
      'Routes on intent, so there\'s no tool picker',
      'Vector memory that survives sessions and devices',
      'Flashcard decks of 10, 20 or 30 from any topic',
      'Scored MCQ quizzes with an explanation per answer',
      'PDF, TXT and MD upload to a summary plus revision checklist',
      'Day-by-day study plans built around a real deadline',
      'A dashboard showing what Athena has picked up about your habits',
      'Markdown with KaTeX maths and highlighted code',
      'Chats export to Markdown, summaries to PDF',
    ],
    stack: [
      { group: 'Frontend', items: ['Next.js 14 App Router', 'TypeScript', 'Tailwind CSS'] },
      { group: 'Backend', items: ['Python 3.11', 'FastAPI', 'LangGraph'] },
      { group: 'Model', items: ['Gemini 2.5 Flash', 'OpenRouter'] },
      { group: 'Memory', items: ['ChromaDB', 'MemPalace'] },
      { group: 'Data', items: ['SQLAlchemy async', 'aiosqlite'] },
      { group: 'Auth', items: ['Clerk', 'JWT bearer'] },
      { group: 'Deploy', items: ['Docker Compose', 'Vercel', 'Railway'] },
    ],
    marginNotes: [
      'the coordinator is really the whole product. everything else is a specialist doing one job',
      'shared reads, owned writes. that one rule is what keeps the memory usable',
    ],
  },

  // ────────────────────────────────────────────────────────────── F1GPT ─────
  {
    slug: 'f1gpt',
    caseNo: '02',
    tagline: 'five days to build, free to re-index',
    lede:
      'F1GPT answers Formula One questions from a corpus it builds itself. An ingestion script drives a headless browser over ten racing sources, splits what it finds into overlapping chunks, embeds them locally, and stores the vectors in Astra DB. Ask it something and the closest chunks get pulled and handed to Gemini, which streams the answer back.',
    problem:
      "Ask a plain language model about F1 and it answers from whatever it absorbed in training, so it's confidently wrong about anything recent. A driver swap, last weekend's result, a regulation change. Retrieval fixes that, but only if rebuilding the index is cheap enough that you'll actually bother doing it.",
    role: 'Solo build. Scraping, embeddings, retrieval, UI.',
    timeline: 'Mar 2025, five days from first commit to last',
    status: 'Live',
    metrics: [
      { value: '10', label: 'sources scraped, Wikipedia through to FIA regs' },
      { value: '512', label: 'characters per chunk, 100 of them overlapping' },
      { value: '384', label: 'dimensions per vector, cosine similarity' },
      { value: '$0', label: 'to re-embed the whole corpus' },
    ],
    architecture: {
      kind: 'pipeline',
      caption:
        'Two halves that never run at the same time. The first three steps are an offline script that builds the index. The last three happen while somebody waits for an answer.',
      steps: [
        { label: 'Scrape', note: 'Puppeteer · 10 sources' },
        { label: 'Split', note: '512 chars / 100 overlap' },
        { label: 'Embed', note: 'all-MiniLM-L6-v2 · local' },
        { label: 'Store', note: 'Astra DB · 384-d cosine' },
        { label: 'Retrieve', note: 'nearest chunks to the question' },
        { label: 'Generate', note: 'Gemini · streamed' },
      ],
      footnote:
        'The same embedding model runs on both sides of the pipeline. Chunks and questions have to land in the same vector space or the distance between them means nothing.',
    },
    decisions: [
      {
        title: 'Embeddings run on my own machine',
        body:
          'all-MiniLM-L6-v2 runs locally through Transformers.js. A hosted embedding API would have been about two lines shorter and would have billed me every time I re-indexed, which is exactly the thing you want to do freely once the corpus goes stale. Running it locally means I can re-run ingestion whenever I like. 384 dimensions also keeps the index small and the search quick.',
      },
      {
        title: 'Puppeteer, because fetch comes back empty',
        body:
          'Most of these sources build their results and standings tables with JavaScript. A plain HTTP fetch gets you the page shell and none of the numbers. So ingestion drives a real browser and reads the DOM once it has settled. Slower per page, and the difference between having a corpus and having nothing.',
      },
      {
        title: 'Chunks overlap by 100 characters',
        body:
          'A hard split cuts sentences in half, and a fact sitting on the boundary becomes unretrievable from either side. Overlapping the windows puts the seam into both neighbours.',
      },
      {
        title: 'Cosine similarity for the search',
        body:
          'Cosine compares direction and ignores magnitude, so a long chunk doesn\'t score as more relevant just for being long. With raw dot product, chunk length leaks into the ranking.',
      },
    ],
    features: [
      'Suggested openers for people who don\'t know what to ask',
      'Answers stream in rather than landing all at once',
      'Corpus covers race results, drivers, teams, news and FIA regulations',
      'Ingestion is a script you re-run, not a fixture you inherit',
    ],
    stack: [
      { group: 'Frontend', items: ['Next.js 15', 'React 19', 'TypeScript'] },
      { group: 'Retrieval', items: ['LangChain', 'RecursiveCharacterTextSplitter'] },
      { group: 'Embeddings', items: ['Transformers.js', 'all-MiniLM-L6-v2'] },
      { group: 'Vector store', items: ['DataStax Astra DB'] },
      { group: 'Model', items: ['Google Gemini', 'Vercel AI SDK'] },
      { group: 'Ingestion', items: ['Puppeteer'] },
    ],
    marginNotes: [
      'the whole trick is that re-indexing costs nothing. a pipeline you can afford to re-run is one that stays current',
      'first RAG thing I built. the chunking numbers are the part I would happily defend',
    ],
  },

  // ─────────────────────────────────────────────────────────── StayEase ─────
  {
    slug: 'stayease',
    caseNo: '03',
    tagline: 'server-rendered, and the error path is the interesting bit',
    lede:
      'StayEase is a stay-listing site rendered entirely on the server. Listings have the full create, read, update and delete cycle, and each one carries nested reviews. Every write validates its payload before the handler runs, and every async handler is wrapped so a rejected promise becomes a real HTTP status instead of a hung request.',
    problem:
      "The default way to build this now is a React client talking to a JSON API, which means a build step, a bundle, loading states and a second copy of your routing. For a listings site that's mostly reads and forms, I didn't think any of that paid for itself. What I found actually interesting was making the validation and error paths airtight.",
    role: 'Solo build. Data model, routing, validation, views.',
    timeline: 'Dec 2025 – Feb 2026',
    status: 'Source is public, nothing deployed',
    metrics: [
      { value: 'CRUD', label: 'plus nested reviews on every listing' },
      { value: '2', label: 'Joi schemas gating every write' },
      { value: '0', label: 'try/catch blocks in the route handlers' },
      { value: 'SSR', label: 'HTML on arrival, no hydration step' },
    ],
    architecture: {
      kind: 'pipeline',
      caption:
        'The request lifecycle. Validation sits in front of the handler, and anything that throws along the way lands in one error handler at the end.',
      steps: [
        { label: 'Request', note: 'GET / POST form' },
        { label: 'Override', note: '_method → PUT / DELETE' },
        { label: 'Validate', note: 'Joi schema middleware' },
        { label: 'Handler', note: 'wrapAsync' },
        { label: 'Mongoose', note: 'listing ⟷ review' },
        { label: 'Render', note: 'EJS + ejs-mate layout' },
      ],
      footnote:
        'Anything that throws becomes an ExpressError carrying a real status code, and the central handler renders the error view from it. A Joi rejection, a missing document, a database failure. A 404 stays a 404.',
    },
    decisions: [
      {
        title: 'Validation sits in middleware',
        body:
          'listingSchema and reviewSchema run in front of every write route. A malformed payload gets a 400 before the handler is even reached, so Mongoose only ever sees shapes it can store and the handler never has to wonder whether its input can be trusted.',
      },
      {
        title: 'One wrapper instead of try/catch everywhere',
        body:
          'wrapAsync is a higher-order function around each async handler that forwards rejections to Express. Without it every route needs its own try/catch, and the one you forget is a request that hangs until it times out.',
      },
      {
        title: 'Errors carry their own status code',
        body:
          'ExpressError takes a status and a message, so a listing that doesn\'t exist throws a 404 and a failed validation throws a 400. The central handler reads the status off the error rather than flattening everything into a 500.',
      },
      {
        title: 'method-override keeps the route table honest',
        body:
          'HTML forms only speak GET and POST. Rather than tunnelling edits and deletes through POST endpoints with verbs in the path, a hidden _method field becomes a real PUT or DELETE.',
      },
    ],
    features: [
      'Full listing lifecycle: browse, create, edit, delete',
      'Reviews nested under each listing, deletable on their own',
      'Shared EJS layout through ejs-mate, so pages declare only content',
      'Seed script for populating a fresh database',
      'Separate error, privacy and terms views',
    ],
    stack: [
      { group: 'Server', items: ['Express 5', 'method-override'] },
      { group: 'Views', items: ['EJS', 'ejs-mate layouts'] },
      { group: 'Data', items: ['MongoDB', 'Mongoose 8'] },
      { group: 'Validation', items: ['Joi'] },
      { group: 'Errors', items: ['ExpressError', 'wrapAsync'] },
    ],
    marginNotes: [
      'the fun part was the error path, not the pages',
      'zero try/catch in the routes. one wrapper covers all of them',
    ],
    repoNote:
      'The source is public but there\'s no hosted instance. It needs a MongoDB connection string to run, so the repository is the honest artefact here.',
  },

  // ───────────────────────────────────────────────────── She-Guardian ──────
  {
    slug: 'she-guardian',
    caseNo: '04',
    tagline: 'it asks before it shares your location',
    lede:
      'She-Guardian is a personal safety companion. Every message gets classified for threat level before anything replies, and the tier that comes back decides what happens next: an empathetic answer, a safety suggestion, an escalation through Twilio and SendGrid, or a question asking permission to share location. Five agent modules do the work and a router picks between them.',
    problem:
      "A safety app that broadcasts your location the second it detects distress has taken a decision away from the person it's supposed to be protecting. And a false positive means your contacts get alarmed over nothing. Detection isn't really the hard part. The hard part is deciding what the system is allowed to do on its own once it thinks something is wrong.",
    role: 'Solo build. Routing, agents, escalation, client.',
    timeline: 'Nov 2025',
    status: 'Source is public, nothing deployed',
    metrics: [
      { value: '4', label: 'threat tiers driving the response' },
      { value: '5', label: 'agent modules: threat, empathy, proactive, reflection, SOS' },
      { value: '1', label: 'consent gate before location leaves the device' },
      { value: 'once', label: 'alarms latch, so contacts never get spammed' },
    ],
    architecture: {
      kind: 'branch',
      caption:
        'Classification happens first and decides everything after it. The hottest branch is the one that does the least on its own.',
      root: 'Threat classifier',
      rootNote: 'Gemini · every inbound message',
      branches: [
        {
          condition: 'High Risk',
          label: 'Ask for consent',
          note: 'holds state, waits for an explicit yes before sharing location',
          tone: 'alarm',
        },
        {
          condition: 'Moderate',
          label: 'Escalate once',
          note: 'SOS agent fires through Twilio + SendGrid, then latches',
          tone: 'alarm',
        },
        {
          condition: 'Mild',
          label: 'Reassure + suggest',
          note: 'empathetic reply with a concrete safety tip',
          tone: 'warn',
        },
        {
          condition: 'None',
          label: 'Just talk',
          note: 'empathy agent responds, nothing escalates',
          tone: 'calm',
        },
      ],
      footnote:
        'Idle time is its own trigger, outside the request path. If a conversation goes quiet for long enough the proactive agent checks in unprompted, once. Closing a session hands the transcript to the reflection agent.',
    },
    decisions: [
      {
        title: 'The highest tier does the least',
        body:
          "High Risk doesn't broadcast anything. It sets a waiting flag and asks whether to send your location to your emergency contacts, and only an explicit yes flips share_location for the client to act on. It sounds backwards and I went back and forth on it. But the tier where the system is most confident is also the tier where taking the decision away from someone matters most.",
      },
      {
        title: 'Alarms latch so they can\'t repeat',
        body:
          'sos_triggered and proactive_sent are one-way flags on the conversation state. A distressing conversation naturally produces several high-threat messages in a row, and without the latch every one of them fires another round of calls and emails.',
      },
      {
        title: 'A failed escalation still answers the user',
        body:
          "The SOS call is wrapped. If Twilio or SendGrid can't be reached, the user still gets a response telling them help has been raised, and the latch still sets. Leaving someone in distress staring at a server error because an SMS provider timed out is about the worst thing this could do.",
      },
      {
        title: 'Silence counts as a signal',
        body:
          'Most chat systems wait to be spoken to. Here the idle minutes get measured, and a long enough gap triggers an unprompted check-in. In a safety context, somebody going quiet mid-conversation tells you something.',
      },
      {
        title: 'Classification happens first, always',
        body:
          'The threat classifier runs on every inbound message before any reply is generated, and the tier it returns picks the strategy. Getting the response right here turned out to be mostly a routing problem.',
      },
    ],
    features: [
      'Threat-tiered conversation with an explicit consent step',
      'Emergency contact management',
      'One-tap emergency buttons',
      'Fake call simulator for getting out of a situation',
      'Proactive check-in after a stretch of silence',
      'End-of-session reflection over the transcript',
      'JWT auth with bcrypt-hashed credentials',
    ],
    stack: [
      { group: 'Frontend', items: ['React 18'] },
      { group: 'Backend', items: ['FastAPI', 'Uvicorn'] },
      { group: 'Model', items: ['Gemini', 'langchain-google-genai'] },
      { group: 'Escalation', items: ['Twilio', 'SendGrid'] },
      { group: 'Data', items: ['SQLAlchemy 2', 'Alembic', 'SQLite'] },
      { group: 'Auth', items: ['python-jose JWT', 'passlib bcrypt'] },
    ],
    marginNotes: [
      'the consent gate is the whole point. a safety tool that overrides you isn\'t really a safety tool',
      'latches, not counters. one escalation per session and no exceptions',
    ],
    candid:
      "LangGraph is in requirements.txt but the StateGraph is still a stub. create_safety_flow returns a placeholder and the real routing is a hand-written async function. It works, and the logic reads clearly enough, but the graph is the part I didn't finish. Rebuilding that router as an actual state machine is the first thing I would do on a second pass.",
    repoNote:
      'Not deployed, because escalation needs live Twilio and SendGrid credentials and a safety tool pointed at real phone numbers isn\'t something to leave running as a demo.',
  },

  // ────────────────────────────────── Diabetic Foot Ulcer Detection ────────
  {
    slug: 'diabetic-foot-ulcer-detection',
    caseNo: '05',
    tagline: 'the dataset was small, so I learned similarity instead',
    lede:
      'This detects diabetic foot ulcers from thermal images. Rather than training one network to label a single image at a time, it pairs images and learns how far apart they are, which is a Siamese setup, with a spatial transformer in front so the network works out its own alignment instead of depending on consistently framed input. It reaches an AUROC of 0.94 on the clinical dataset.',
    problem:
      'Diabetic foot ulcers are common and largely preventable, and thermal asymmetry shows up before anything is visible on the surface, which is what makes early screening worth doing at all. The problem is data. Clinical thermal datasets are small and imbalanced, and that\'s exactly the regime where a conventional image classifier starts memorising rather than generalising.',
    role: 'Model design, training, evaluation, and the paper.',
    timeline: 'Nov 2025 – Jan 2026, paper submitted Feb 2026',
    status: 'Under peer review',
    metrics: [
      { value: '0.94', label: 'AUROC on the clinical dataset' },
      { value: 'Siamese', label: 'twin branches on shared weights' },
      { value: 'STN', label: 'alignment learned, not preprocessed' },
    ],
    architecture: {
      kind: 'pipeline',
      caption:
        'Both branches are the same network with the same weights. What gets learned isn\'t "ulcer or not" directly, but how far apart two images are.',
      steps: [
        { label: 'Thermal pair', note: 'two input images' },
        { label: 'STN', note: 'learns the alignment transform' },
        { label: 'Shared CNN', note: 'identical weights, both branches' },
        { label: 'Embeddings', note: 'one vector per image' },
        { label: 'Distance', note: 'similarity across the pair' },
        { label: 'Decision', note: 'thresholded, scored by AUROC' },
      ],
      footnote:
        'Sharing the weights is what makes the comparison mean anything. Both images get mapped by the same function, so distance in the embedding space reflects a difference between the feet rather than a difference between the branches.',
    },
    decisions: [
      {
        title: 'Learn similarity rather than a label',
        body:
          'With a small clinical dataset, every pair of images becomes a training example, so n images give you far more usable comparisons than n labels would. A Siamese setup uses that directly, and it holds up better than a plain classifier when one class is thinly represented.',
      },
      {
        title: 'Let the model handle its own alignment',
        body:
          'Thermal foot images aren\'t captured in a consistent pose or framing. The usual fix is a manual registration step before training. A spatial transformer makes alignment part of the model instead, learned end to end, tuned for what the network needs rather than for what looks aligned to a person.',
      },
      {
        title: 'AUROC rather than accuracy',
        body:
          'On an imbalanced medical dataset, accuracy flatters any model that leans toward the majority class. AUROC measures how well positives are ranked above negatives across every threshold, which is the honest number while the operating point is still unfixed.',
      },
    ],
    features: [
      'Thermal imaging rather than visible-light photography',
      'Alignment trained end to end with the rest of the model',
      'Evaluation that doesn\'t depend on a chosen threshold',
      'Written up and submitted for peer review',
    ],
    stack: [
      { group: 'Framework', items: ['PyTorch'] },
      { group: 'Architecture', items: ['Siamese network', 'Spatial Transformer Network'] },
      { group: 'Imaging', items: ['OpenCV', 'Thermal preprocessing'] },
    ],
    marginNotes: [
      'thermal asymmetry shows up before anything is visible. that\'s the whole clinical case for screening',
      'pairs, not labels. on a dataset this size it\'s the only honest way to train',
    ],
    repoNote:
      'No public repository. The work sits on a clinical dataset and the paper is still under review, but I\'m happy to walk through the architecture and the results directly.',
  },
];

export function getProjectDetail(slug: string): ProjectDetail | undefined {
  return PROJECT_DETAILS.find((d) => d.slug === slug);
}
