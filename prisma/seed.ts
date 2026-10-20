import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/prisma/client.js';

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

// [name, Simple Icons slug (null = no logo), optional custom slug]
type Entry = [name: string, iconSlug: string | null, slug?: string];

const TAGS: Entry[] = [
  // Languages
  ['JavaScript', 'javascript'],
  ['TypeScript', 'typescript'],
  ['Python', 'python'],
  ['Java', 'openjdk'],
  ['C', 'c'],
  ['C++', 'cplusplus'],
  ['C#', null],
  ['Go', 'go'],
  ['Rust', 'rust'],
  ['Kotlin', 'kotlin'],
  ['Swift', 'swift'],
  ['Dart', 'dart'],
  ['PHP', 'php'],
  ['Ruby', 'ruby'],
  ['R', 'r'],
  ['Scala', 'scala'],
  ['Elixir', 'elixir'],
  ['Erlang', 'erlang'],
  ['Haskell', 'haskell'],
  ['Lua', 'lua'],
  ['Perl', 'perl'],
  ['Julia', 'julia'],
  ['Zig', 'zig'],
  ['Clojure', 'clojure'],
  ['F#', 'fsharp'],
  ['Groovy', 'apachegroovy'],
  ['Objective-C', null],
  ['Solidity', 'solidity'],
  ['HTML', 'html5'],
  ['CSS', 'css'],
  ['SQL', null],
  ['Bash', 'gnubash'],
  ['PowerShell', null],
  ['MATLAB', null],
  ['Assembly', null],

  // Frontend
  ['React', 'react'],
  ['Vue.js', 'vuedotjs'],
  ['Angular', 'angular'],
  ['Svelte', 'svelte'],
  ['SolidJS', 'solid'],
  ['Qwik', 'qwik'],
  ['jQuery', 'jquery'],
  ['Next.js', 'nextdotjs'],
  ['Nuxt', 'nuxt'],
  ['Remix', 'remix'],
  ['Astro', 'astro'],
  ['Gatsby', 'gatsby'],
  ['Tailwind CSS', 'tailwindcss'],
  ['Bootstrap', 'bootstrap'],
  ['Sass', 'sass'],
  ['shadcn/ui', 'shadcnui', 'shadcn-ui'],
  ['Material UI', 'mui'],
  ['Redux', 'redux'],
  ['TanStack Query', 'reactquery'],
  ['Three.js', 'threedotjs'],

  // Backend
  ['Node.js', 'nodedotjs'],
  ['Deno', 'deno'],
  ['Bun', 'bun'],
  ['Express', 'express'],
  ['NestJS', 'nestjs'],
  ['Fastify', 'fastify'],
  ['Hono', 'hono'],
  ['Koa', 'koa'],
  ['.NET', 'dotnet', 'dotnet'],
  ['ASP.NET Core', null, 'aspnet-core'],
  ['Blazor', 'blazor'],
  ['Spring', 'spring'],
  ['Spring Boot', 'springboot'],
  ['Quarkus', 'quarkus'],
  ['Micronaut', 'micronaut'],
  ['Ktor', 'ktor'],
  ['Django', 'django'],
  ['Flask', 'flask'],
  ['FastAPI', 'fastapi'],
  ['Laravel', 'laravel'],
  ['Symfony', 'symfony'],
  ['Ruby on Rails', 'rubyonrails'],
  ['Phoenix', 'phoenixframework'],
  ['Gin', 'gin'],
  ['GraphQL', 'graphql'],
  ['Apollo GraphQL', 'apollographql'],
  ['tRPC', 'trpc'],
  ['Socket.IO', 'socketdotio'],

  // Mobile & desktop
  ['React Native', 'react', 'react-native'],
  ['Flutter', 'flutter'],
  ['Expo', 'expo'],
  ['Ionic', 'ionic'],
  ['Jetpack Compose', 'jetpackcompose'],
  ['SwiftUI', null],
  ['Electron', 'electron'],
  ['Tauri', 'tauri'],

  // Build, test, data/ML, games
  ['Vite', 'vite'],
  ['Webpack', 'webpack'],
  ['Jest', 'jest'],
  ['Vitest', 'vitest'],
  ['Cypress', 'cypress'],
  ['Playwright', null],
  ['PyTorch', 'pytorch'],
  ['TensorFlow', 'tensorflow'],
  ['Pandas', 'pandas'],
  ['NumPy', 'numpy'],
  ['scikit-learn', 'scikitlearn'],
  ['Unity', 'unity'],
  ['Unreal Engine', 'unrealengine'],
  ['Godot', 'godotengine'],

  // Databases
  ['PostgreSQL', 'postgresql'],
  ['MySQL', 'mysql'],
  ['MariaDB', 'mariadb'],
  ['SQLite', 'sqlite'],
  ['Microsoft SQL Server', null, 'sql-server'],
  ['Oracle Database', null],
  ['MongoDB', 'mongodb'],
  ['Redis', 'redis'],
  ['Cassandra', 'apachecassandra'],
  ['DynamoDB', null],
  ['Firebase', 'firebase'],
  ['Supabase', 'supabase'],
  ['Neon', 'neon'],
  ['PlanetScale', 'planetscale'],
  ['CockroachDB', 'cockroachlabs'],
  ['Couchbase', 'couchbase'],
  ['Neo4j', 'neo4j'],
  ['Elasticsearch', 'elasticsearch'],
  ['ClickHouse', 'clickhouse'],
  ['InfluxDB', 'influxdb'],
  ['Turso', 'turso'],

  // ORMs
  ['Prisma', 'prisma'],
  ['Drizzle', 'drizzle'],
  ['TypeORM', 'typeorm'],
  ['Sequelize', 'sequelize'],
  ['Mongoose', 'mongoose'],
  ['MikroORM', null],
  ['Knex.js', null],
  ['Hibernate', 'hibernate'],
  ['Entity Framework Core', null, 'ef-core'],
  ['Dapper', null],
  ['SQLAlchemy', 'sqlalchemy'],
  ['Eloquent', null],
  ['GORM', null],
  ['Room', null],

  // Code & collaboration
  ['Git', 'git'],
  ['GitHub', 'github'],
  ['GitLab', 'gitlab'],
  ['Bitbucket', 'bitbucket'],
  ['GitHub Actions', 'githubactions'],
  ['Jira', 'jira'],
  ['Confluence', 'confluence'],
  ['Trello', 'trello'],
  ['Notion', 'notion'],
  ['Linear', 'linear'],
  ['Asana', 'asana'],
  ['ClickUp', 'clickup'],
  ['Slack', null],
  ['Discord', 'discord'],
  ['Obsidian', 'obsidian'],
  ['Zapier', 'zapier'],
  ['n8n', 'n8n'],

  // Editors & dev tools
  ['VS Code', null, 'vscode'],
  ['IntelliJ IDEA', 'intellijidea'],
  ['WebStorm', 'webstorm'],
  ['Android Studio', 'androidstudio'],
  ['Xcode', 'xcode'],
  ['Vim', 'vim'],
  ['Neovim', 'neovim'],
  ['Postman', 'postman'],
  ['Insomnia', 'insomnia'],
  ['Swagger', 'swagger'],
  ['npm', 'npm'],
  ['pnpm', 'pnpm'],
  ['Yarn', 'yarn'],
  ['ESLint', 'eslint'],
  ['Prettier', 'prettier'],
  ['Storybook', 'storybook'],

  // DevOps, cloud & monitoring
  ['Docker', 'docker'],
  ['Kubernetes', 'kubernetes'],
  ['Terraform', 'terraform'],
  ['Ansible', 'ansible'],
  ['Jenkins', 'jenkins'],
  ['Nginx', 'nginx'],
  ['Linux', 'linux'],
  ['Ubuntu', 'ubuntu'],
  ['Sentry', 'sentry'],
  ['Grafana', 'grafana'],
  ['Prometheus', 'prometheus'],
  ['Stripe', 'stripe'],
  ['AWS', null],
  ['Google Cloud', 'googlecloud'],
  ['Microsoft Azure', null, 'azure'],
  ['Vercel', 'vercel'],
  ['Netlify', 'netlify'],
  ['Cloudflare', 'cloudflare'],
  ['Heroku', 'heroku'],
  ['Render', 'render'],
  ['Railway', 'railway'],
  ['DigitalOcean', 'digitalocean'],
  ['Fly.io', 'flydotio'],

  // AI
  ['Claude', 'claude'],
  ['Claude Code', 'claude', 'claude-code'],
  ['Anthropic', 'anthropic'],
  ['ChatGPT', 'openai', 'chatgpt'],
  ['OpenAI', 'openai'],
  ['Codex', 'openai', 'codex'],
  ['Gemini', 'googlegemini'],
  ['Antigravity', null],
  ['Grok', null],
  ['DeepSeek', null],
  ['Mistral AI', 'mistralai'],
  ['Perplexity', 'perplexity'],
  ['Meta Llama', 'meta', 'llama'],
  ['GitHub Copilot', 'githubcopilot'],
  ['Cursor', 'cursor'],
  ['Windsurf', 'windsurf'],
  ['v0', 'v0'],
  ['Lovable', null],
  ['Replit', 'replit'],
  ['Hugging Face', 'huggingface'],
  ['Ollama', 'ollama'],
  ['LangChain', 'langchain'],
  ['Midjourney', null],
  ['ChatCut', null],

  // Design
  ['Figma', 'figma'],
  ['Framer', 'framer'],
  ['Sketch', 'sketch'],
  ['Webflow', 'webflow'],
  ['Miro', 'miro'],
  ['Canva', null],
  ['Blender', 'blender'],
  ['Adobe Photoshop', 'adobephotoshop'],
  ['Adobe Illustrator', 'adobeillustrator'],
  ['Adobe Premiere Pro', 'adobepremierepro'],
  ['Adobe After Effects', 'adobeaftereffects'],
  ['Adobe XD', 'adobexd'],
  ['Adobe Lightroom', 'adobelightroom'],
  ['Adobe InDesign', 'adobeindesign'],
  ['Adobe Acrobat', 'adobeacrobatreader'],
  ['Affinity', 'affinity'],
  ['Affinity Designer', 'affinitydesigner'],
  ['Affinity Photo', 'affinityphoto'],
  ['Affinity Publisher', 'affinitypublisher'],
];

// "C#" → "csharp", "C++" → "cpp", "Node.js" → "node-js"
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/#/g, 'sharp')
    .replace(/\+/g, 'p')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Create each tag, or update its name/icon if the slug already exists.
async function main() {
  const tags = TAGS.map(([name, iconSlug, slug]) => ({
    name,
    iconSlug,
    slug: slug ?? slugify(name),
  }));

  const slugs = tags.map((t) => t.slug);
  const duplicates = slugs.filter((s, i) => slugs.indexOf(s) !== i);
  if (duplicates.length) {
    throw new Error(`Duplicate tag slugs: ${duplicates.join(', ')}`);
  }

  for (const tag of tags) {
    await prisma.tag.upsert({
      where: { slug: tag.slug },
      update: { name: tag.name, iconSlug: tag.iconSlug },
      create: tag,
    });
  }
  console.log(`Seeded ${tags.length} tags`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
