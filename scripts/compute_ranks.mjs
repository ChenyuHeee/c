#!/usr/bin/env node
import {promises as fs} from 'fs';
import path from 'path';
import {execSync, execFileSync} from 'child_process';

const ROOT = path.resolve(process.cwd());
const SUBMISSIONS = path.join(ROOT, 'submissions');
const DATA_DIR = path.join(ROOT, 'competition', 'data');
const REPO = process.env.GITHUB_REPOSITORY || '';
function getCurrentBranch(){
  try{ return execSync('git rev-parse --abbrev-ref HEAD', {encoding:'utf8'}).trim(); }catch(e){ return 'main'; }
}

function log(...args){ console.log('[rank]', ...args); }

async function ensureDir(p){ await fs.mkdir(p, {recursive: true}); }

async function listDirs(dir){
  try{
    const ents = await fs.readdir(dir, {withFileTypes:true});
    return ents.filter(e=>e.isDirectory()).map(e=>e.name);
  }catch(e){ return []; }
}

async function listFiles(dir){
  try{
    const ents = await fs.readdir(dir, {withFileTypes:true});
    return ents.filter(e=>e.isFile()).map(e=>e.name);
  }catch(e){ return []; }
}

function getCommitMeta(fileAbs){
  // Use execFileSync to avoid shell-quoting issues (handles spaces in paths like "He Chenyu/")
  const relPath = path.relative(ROOT, fileAbs).split(path.sep).join('/');
  try{
    // Prefer author date for "提交时间"; switch to %cI if you want committer/merge time
    const out = execFileSync('git', ['log','-1','--format=%H|%aI','--', relPath], {encoding:'utf8'}).trim();
    const [sha, iso] = out.split('|');
    if(sha && iso) return {sha, time: iso};
    throw new Error('parse-failed');
  }catch(e){
    // Fallback: HEAD sha + now; indicates history may be shallow or path lookup failed
    let sha='';
    try{ sha = execSync('git rev-parse HEAD', {encoding:'utf8'}).trim(); }catch(_){ sha=''; }
    return {sha, time: new Date().toISOString()};
  }
}

async function computeWeek(week){
  const weekDir = path.join(SUBMISSIONS, `week-${week}`);
  const handles = await listDirs(weekDir);
  const entries = [];
  for(const handle of handles){
    const hDir = path.join(weekDir, handle);
    const files = (await listFiles(hDir)).filter(f=>f.endsWith('.c')).sort();
    if(files.length===0) continue;
    // Prefer solution.c if exists
    const pick = files.includes('solution.c') ? 'solution.c' : files[0];
    const fAbs = path.join(hDir, pick);
    const buf = await fs.readFile(fAbs);
    const bytes = Buffer.byteLength(buf);
    const meta = getCommitMeta(fAbs);
    const relPosix = ['submissions', `week-${week}`, handle, pick].join('/');
    entries.push({handle, bytes, commitTime: meta.time, sha: meta.sha, path: relPosix});
  }
  // sort: bytes asc, time asc
  entries.sort((a,b)=> a.bytes!==b.bytes ? a.bytes-b.bytes : (a.commitTime < b.commitTime ? -1 : a.commitTime > b.commitTime ? 1 : 0));
  const out = { repo: REPO, week, branch: getCurrentBranch(), updatedAt: new Date().toISOString(), ranks: entries };
  await ensureDir(DATA_DIR);
  await fs.writeFile(path.join(DATA_DIR, `week-${week}.json`), JSON.stringify(out, null, 2)+"\n");
  log(`week-${week}: ${entries.length} entries`);
  return out;
}

async function aggregateTotal(){
  const files = (await listFiles(DATA_DIR)).filter(f=>/^week-\d+\.json$/.test(f)).sort();
  const byHandle = new Map();
  for(const f of files){
    const obj = JSON.parse(await fs.readFile(path.join(DATA_DIR, f), 'utf8'));
    const week = obj.week;
    for(const r of (obj.ranks||[])){
      const cur = byHandle.get(r.handle) || {handle:r.handle, weeks:0, best:Infinity};
      cur.weeks = cur.weeks + 1;
      if(typeof r.bytes === 'number' && r.bytes < cur.best){ cur.best = r.bytes; }
      byHandle.set(r.handle, cur);
    }
  }
  const ranks = Array.from(byHandle.values()).map(v=>({handle:v.handle, weeks:v.weeks, best: Number.isFinite(v.best)? v.best : null}));
  ranks.sort((a,b)=>{
    if(a.best==null && b.best==null) return 0;
    if(a.best==null) return 1;
    if(b.best==null) return -1;
    return a.best - b.best || (b.weeks - a.weeks);
  });
  const out = { repo: REPO, updatedAt: new Date().toISOString(), ranks };
  await fs.writeFile(path.join(DATA_DIR, 'total.json'), JSON.stringify(out, null, 2)+"\n");
  log(`total: ${ranks.length} handles`);
  return out;
}

async function main(){
  const weekEnv = process.env.WEEK || '1';
  const weeks = weekEnv.split(',').map(s=>parseInt(s.trim(),10)).filter(n=>!Number.isNaN(n));
  for(const w of weeks){ await computeWeek(w); }
  await aggregateTotal();
}

main().catch(err=>{ console.error(err); process.exit(1); });
