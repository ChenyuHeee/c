#!/usr/bin/env node
/*
  sync_problems_from_ccodegolf.mjs
  拉取远程题库（ChenyuHeee/ccodegolf）下的 <id>/problem.md 与 tests.json
  生成/更新本仓库：
    - competition/problems.json
    - competition/data/tests/week-<id>.json
    - competition/problems/<id>.md (可选)

  用法：
    node scripts/sync_problems_from_ccodegolf.mjs
  可设置环境变量：
    SOURCE_BASE - raw content base URL，默认 https://raw.githubusercontent.com/ChenyuHeee/ccodegolf/main
    MAX_ID - 最大尝试 id（默认 99）
    OUT_DIR - 项目根，默认 process.cwd()
*/

import { promises as fs } from 'fs';
import path from 'path';
// 使用 Node 18+ 自带的全局 fetch（GitHub Actions 使用 Node 20）。

const ROOT = process.cwd();
const SOURCE_BASE = process.env.SOURCE_BASE || 'https://raw.githubusercontent.com/ChenyuHeee/ccodegolf/main';
const MAX_ID = parseInt(process.env.MAX_ID || '99', 10);
const OUT_COMP_DIR = path.join(ROOT, 'competition');
const OUT_PROBLEMS_JSON = path.join(OUT_COMP_DIR, 'problems.json');
const OUT_TEST_DIR = path.join(OUT_COMP_DIR, 'data', 'tests');
const OUT_PROB_MD_DIR = path.join(OUT_COMP_DIR, 'problems');

function log(...args){ console.log('[sync]', ...args); }

async function ensureDir(p){ await fs.mkdir(p, { recursive: true }); }

async function tryFetchText(url){
  try{
    const r = await fetch(url);
    if(!r.ok) return null;
    return await r.text();
  }catch(e){ return null; }
}

function parseFrontmatter(md){
  // 返回 {meta:Object, body:string}
  if(!md) return { meta: {}, body: '' };
  const lines = md.split(/\r?\n/);
  if(lines[0].trim() !== '---'){
    return { meta: {}, body: md };
  }
  let i = 1;
  const fm = [];
  while(i < lines.length && lines[i].trim() !== '---'){
    fm.push(lines[i]); i++; }
  const body = lines.slice(i+1).join('\n');
  const meta = simpleYamlParse(fm.join('\n'));
  return { meta, body };
}

function simpleYamlParse(text){
  // 仅实现非常有限的 YAML 子集：键: 值，键: | 多行缩进块，和 tests: - items
  const out = {};
  const lines = text.split(/\r?\n/);
  let i=0;
  while(i<lines.length){
    let line = lines[i];
    if(/^\s*$/.test(line)){ i++; continue; }
    const m = line.match(/^([a-zA-Z0-9_\-]+)\s*:\s*(.*)$/);
    if(!m){ i++; continue; }
    const key = m[1];
    let val = m[2] ?? '';
    if(val === '|'){ // block scalar
      i++; const buf = [];
      while(i<lines.length && /^\s/.test(lines[i])){ buf.push(lines[i].replace(/^\s{0,2}/,'')); i++; }
      out[key] = buf.join('\n');
      continue;
    }
    // handle quoted strings
    if(/^".*"$/.test(val) || /^'.*'$/.test(val)){
      val = val.slice(1,-1);
    }
    // try parse number
    if(/^\d+$/.test(val)) out[key] = Number(val);
    else out[key] = val;
    i++;
  }
  return out;
}

async function findProblemIds(){
  // 优先尝试 index.json
  const idxUrl = `${SOURCE_BASE}/index.json`;
  const idxText = await tryFetchText(idxUrl);
  if(idxText){
    try{ const j = JSON.parse(idxText); if(Array.isArray(j)) return j.map(x=>typeof x==='number'?x:(x.number||x.id)).filter(Boolean); }catch(e){}
  }
  // 退化：扫描 0..MAX_ID，记录存在的 ones
  log('index.json not found; scanning 0..' + MAX_ID + ' (this may be slow)');
  const ids = [];
  let misses = 0;
  for(let id=0; id<=MAX_ID; id++){
    const url = `${SOURCE_BASE}/${id}/problem.md`;
    const txt = await tryFetchText(url);
    if(txt){ ids.push(id); misses = 0; }
    else{ misses++; }
    // 若连续 15 个空缺，则提前停止
    if(misses>15) break;
  }
  return ids;
}

async function sync(){
  await ensureDir(OUT_COMP_DIR);
  await ensureDir(OUT_TEST_DIR);
  await ensureDir(OUT_PROB_MD_DIR);
  const ids = await findProblemIds();
  log('found ids:', ids.join(','));
  const problems = [];
  for(const id of ids){
    const mdUrl = `${SOURCE_BASE}/${id}/problem.md`;
    const md = await tryFetchText(mdUrl);
    if(!md){ log('skip', id, 'no problem.md'); continue; }
    const { meta, body } = parseFrontmatter(md);
    const p = {
      id: Number(meta.number ?? meta.id ?? id),
      slug: meta.slug || meta.title?.toLowerCase().replace(/[^a-z0-9]+/g,'-') || `p${id}`,
      name_zh: meta.name_zh || meta.title || meta.name || meta.name_cn || '',
      name_en: meta.name_en || meta.title_en || meta.title || '',
      short: meta.short || meta.summary || '',
      difficulty: typeof meta.difficulty === 'number' ? meta.difficulty : (meta.difficulty? Number(meta.difficulty) : undefined),
      desc: meta.desc || meta.description || meta.desc_en || '',
      sourceUrl: mdUrl,
      updatedAt: meta.updatedAt || meta.updated || new Date().toISOString()
    };
    // write local copy of md for reference
    try{ await fs.writeFile(path.join(OUT_PROB_MD_DIR, `${p.id}.md`), md, 'utf8'); }catch(e){ }

    // try tests: first check frontmatter 'tests_file' or 'tests'
    let tests = null;
    if(meta.tests_file){
      const turl = `${SOURCE_BASE}/${id}/${meta.tests_file}`;
      const ttxt = await tryFetchText(turl);
      try{ tests = JSON.parse(ttxt); }catch(e){}
    }
    if(!tests){
      // try tests.json in same dir
      const turl1 = `${SOURCE_BASE}/${id}/tests.json`;
      const t1 = await tryFetchText(turl1);
      if(t1){ try{ tests = JSON.parse(t1); }catch(e){} }
    }
    if(!tests){
      // try tests/week-<id>.json
      const turl2 = `${SOURCE_BASE}/${id}/week-${id}.json`;
      const t2 = await tryFetchText(turl2);
      if(t2){ try{ tests = JSON.parse(t2); }catch(e){} }
    }

    if(Array.isArray(tests) && tests.length>0){
      const outPath = path.join(OUT_TEST_DIR, `week-${p.id}.json`);
      await fs.writeFile(outPath, JSON.stringify(tests, null, 2)+'\n', 'utf8');
      log('wrote tests for', p.id);
      p.testsPath = `data/tests/week-${p.id}.json`;
    }

    // ensure numeric id and difficulty
    if(!p.id) p.id = id;
    if(typeof p.difficulty !== 'number') p.difficulty = p.difficulty ? Number(p.difficulty) : undefined;
    problems.push(p);
    log('synced', p.id, p.name_en||p.name_zh||p.slug);
  }
  problems.sort((a,b)=>a.id-b.id);
  await fs.writeFile(OUT_PROBLEMS_JSON, JSON.stringify(problems, null, 2)+'\n', 'utf8');
  log('wrote', OUT_PROBLEMS_JSON);
}

sync().catch(err=>{ console.error(err); process.exit(1); });
