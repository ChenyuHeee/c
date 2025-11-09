
import fs from 'fs/promises';
import path from 'path';
import yaml from 'js-yaml';

const REPO_URL = 'https://raw.githubusercontent.com/ChenyuHeee/ccodegolf/main/';
const PROBLEMS_JSON_PATH = path.join('competition', 'problems.json');
const TESTS_DIR = path.join('competition', 'data', 'tests');
const PROBLEMS_MD_DIR = path.join('competition', 'problems');

async function syncProblems() {
  try {
    await fs.mkdir(TESTS_DIR, { recursive: true });
    await fs.mkdir(PROBLEMS_MD_DIR, { recursive: true });

    const indexUrl = `${REPO_URL}index.json`;
    console.log(`Fetching problem index from ${indexUrl}`);
    let problemIds = [];
    try {
      const indexResponse = await fetch(indexUrl);
      if (indexResponse.ok) {
        problemIds = await indexResponse.json();
        console.log(`Found problem IDs: ${problemIds}`);
      } else if (indexResponse.status === 404) {
        console.log('index.json not found, falling back to default problem IDs: [0, 1]');
        problemIds = [0, 1];
      } else {
        throw new Error(`Failed to fetch index.json: ${indexResponse.statusText}`);
      }
    } catch (error) {
        console.warn(`Could not fetch index.json, falling back to default problem IDs: [0, 1]. Error: ${error.message}`);
        problemIds = [0, 1];
    }

    const problems = [];

    for (const id of problemIds) {
      try {
        const problemUrl = `${REPO_URL}${id}/problem.md`;
        console.log(`Fetching problem markdown from ${problemUrl}`);
        const problemResponse = await fetch(problemUrl);
        if (!problemResponse.ok) {
          console.warn(`Skipping problem ${id}: Failed to fetch problem.md (${problemResponse.statusText})`);
          continue;
        }
        const problemMd = await problemResponse.text();

        // Save a copy of the markdown file
        const problemMdPath = path.join(PROBLEMS_MD_DIR, `${id}.md`);
        await fs.writeFile(problemMdPath, problemMd);
        console.log(`Saved problem markdown to ${problemMdPath}`);

        const { metadata, content } = parseFrontmatter(problemMd);

        const problemData = {
          id: metadata.number ?? id,
          title: metadata.title,
          short_desc_en: metadata.short_desc_en || metadata.short,
          short_desc_zh: metadata.short_desc_zh || metadata.short,
          difficulty: metadata.difficulty,
          desc_en: metadata.desc_en || content,
          desc_zh: metadata.desc_zh || content,
        };

        problems.push(problemData);

        if (metadata.tests_file) {
          const testsUrl = `${REPO_URL}${id}/${metadata.tests_file}`;
          console.log(`Fetching tests from ${testsUrl}`);
          const testsResponse = await fetch(testsUrl);
          if (testsResponse.ok) {
            const testsJson = await testsResponse.json();
            const testsPath = path.join(TESTS_DIR, `prob-${id}.json`);
            await fs.writeFile(testsPath, JSON.stringify(testsJson, null, 2));
            console.log(`Saved tests to ${testsPath}`);
          } else {
            console.warn(`Skipping tests for problem ${id}: Failed to fetch ${metadata.tests_file}`);
          }
        } else {
           // Also check for tests.json by default
           const testsUrl = `${REPO_URL}${id}/tests.json`;
           console.log(`Checking for default tests.json at ${testsUrl}`);
           const testsResponse = await fetch(testsUrl);
           if (testsResponse.ok) {
             const testsJson = await testsResponse.json();
             const testsPath = path.join(TESTS_DIR, `prob-${id}.json`);
             await fs.writeFile(testsPath, JSON.stringify(testsJson, null, 2));
             console.log(`Saved tests to ${testsPath}`);
           } else {
              console.log(`No tests_file specified or default tests.json found for problem ${id}.`);
           }
        }
      } catch (error) {
        console.error(`Failed to process problem ${id}:`, error);
        // Continue to the next problem
      }
    }

    await fs.writeFile(PROBLEMS_JSON_PATH, JSON.stringify(problems, null, 2));
    console.log(`Successfully synced ${problems.length} problems to ${PROBLEMS_JSON_PATH}`);

  } catch (error) {
    console.error('Error during problem sync:', error);
    // Write an empty array to signal failure but prevent breaking the site
    await fs.writeFile(PROBLEMS_JSON_PATH, JSON.stringify([], null, 2));
  }
}

function parseFrontmatter(mdContent) {
  const match = mdContent.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)/);
  if (!match) {
    return { metadata: {}, content: mdContent };
  }

  const frontmatter = match[1];
  const content = match[2] || '';
  
  try {
    const metadata = yaml.load(frontmatter);
    return { metadata, content };
  } catch (e) {
    console.error("Error parsing YAML frontmatter:", e);
    console.log("Attempting manual extraction...");
    
    // Fallback: manually extract key-value pairs
    const metadata = {};
    const lines = frontmatter.split('\n');
    let currentKey = null;
    let currentValue = '';
    
    for (const line of lines) {
      const keyMatch = line.match(/^([a-zA-Z_][a-zA-Z0-9_]*)\s*:\s*(.*)$/);
      if (keyMatch && !line.startsWith(' ') && !line.startsWith('\t')) {
        // Save previous key-value
        if (currentKey) {
          metadata[currentKey] = currentValue.trim();
        }
        // Start new key
        currentKey = keyMatch[1];
        currentValue = keyMatch[2] || '';
      } else if (currentKey && (line.startsWith(' ') || line.startsWith('\t'))) {
        // Continuation of current value
        currentValue += '\n' + line.trim();
      }
    }
    
    // Save last key-value
    if (currentKey) {
      metadata[currentKey] = currentValue.trim();
    }
    
    // Convert numeric strings
    if (metadata.number) metadata.number = parseInt(metadata.number, 10);
    if (metadata.difficulty) metadata.difficulty = parseInt(metadata.difficulty, 10);
    
    console.log("Manual extraction result:", metadata);
    return { metadata, content };
  }
}

syncProblems();
