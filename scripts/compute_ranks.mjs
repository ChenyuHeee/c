#!/usr/bin/env node
import {promises as fs} from 'fs';
import path from 'path';
import {execSync, execFileSync} from 'child_process';

const ROOT = path.resolve(process.cwd());
// 配置：每一轮对应的难度积分 D。支持两种目录形式：
//  旧：submissions/week-<n>/
//  新：submissions/<n>/
// 若两者同时存在，以新目录内容为准（避免重复计数）。未配置的轮次默认 100 分。
// 注意：优先从 problems.json 读取难度，此处配置作为 fallback
const ROUND_DIFFICULTY = Object.freeze({
  // 题目难度优先从 problems.json 读取，下方配置仅在文件不存在或缺少数据时使用
  // 0: 150,
  // 1: 150,
  // 2: 150,
  // 3: 200,
});
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

function tryParseContestEncrypted(text){
  try{
    // Fast check: must start with '{'
    if(!/^\s*\{/.test(text)) return null;
    const obj = JSON.parse(text);
    if(!obj || obj.type!=='contest') return null;
    if(obj.version!==3 || !obj.encCode || !obj.key) return null; // only v3 supported in ranking decrypt
    // Decode hex -> bytes
    if(!/^([0-9a-fA-F]{2})+$/.test(obj.key) || !/^([0-9a-fA-F]{2})+$/.test(obj.encCode)) return null;
    const toBytes = (hex)=>{ const arr=new Uint8Array(hex.length/2); for(let i=0;i<arr.length;i++){ arr[i]=parseInt(hex.substr(i*2,2),16); } return arr; };
    const keyBytes = toBytes(obj.key);
    const encBytes = toBytes(obj.encCode);
    const out = new Uint8Array(encBytes.length);
    for(let i=0;i<encBytes.length;i++){ out[i] = encBytes[i] ^ keyBytes[i % keyBytes.length]; }
    const code = new TextDecoder().decode(out);
    return { code, meta: obj }; // meta includes challenge
  }catch(e){ return null; }
}

async function computeProblem(problemId){
  // 若未在映射中，尝试从 competition/problems.json 读取对应难度 D
  let difficultyFromMap = ROUND_DIFFICULTY[problemId];
  if(typeof difficultyFromMap !== 'number'){
    try{
      const pj = JSON.parse(await fs.readFile(path.join(DATA_DIR, '..', 'problems.json'), 'utf8'));
      const p = Array.isArray(pj) ? pj.find(x=>x && x.id===problemId) : null;
      if(p && typeof p.difficulty==='number') difficultyFromMap = p.difficulty;
    }catch(_){ /* ignore */ }
  }
  const legacyDir = path.join(SUBMISSIONS, `week-${problemId}`);
  const newDir = path.join(SUBMISSIONS, String(problemId));
  const legacyHandles = await listDirs(legacyDir);
  const newHandles = await listDirs(newDir);
  // 合并 handle，若新目录存在同名则优先使用新目录
  const handleSet = new Set([...legacyHandles, ...newHandles]);
  const handles = Array.from(handleSet).sort();
  const entries = [];
  for(const handle of handles){
    const baseDir = newHandles.includes(handle) ? newDir : legacyDir;
    const hDir = path.join(baseDir, handle);
    const files = (await listFiles(hDir)).filter(f=>f.endsWith('.c')).sort();
    if(files.length===0) continue;
    // Prefer solution.c if exists
    const pick = files.includes('solution.c') ? 'solution.c' : files[0];
    const fAbs = path.join(hDir, pick);
  const buf = await fs.readFile(fAbs);
  // 默认按原文件字节数（纯文本 .c）计数；若检测到 contest v3 密文则按解密后的 UTF-8 字节计数
  let bytes = buf.length; // Buffer.len 是真实字节数，避免误用 Buffer.byteLength(…) 的编码语义
  let decryptedCode = null;
    try{
      const txt = buf.toString('utf8');
      const parsed = tryParseContestEncrypted(txt);
      if(parsed){
        decryptedCode = parsed.code;
  bytes = Buffer.byteLength(decryptedCode, 'utf8'); // bytes of original code
      }
    }catch(_){ /* ignore parse errors */ }
    const meta = getCommitMeta(fAbs);
    // 记录路径：使用实际目录（新或旧）。
    const relPosix = ['submissions', (newHandles.includes(handle)? String(problemId): `week-${problemId}`), handle, pick].join('/');
    entries.push({handle, bytes, commitTime: meta.time, sha: meta.sha, path: relPosix});
  }
  // sort: bytes asc, time asc
  entries.sort((a,b)=> a.bytes!==b.bytes ? a.bytes-b.bytes : (a.commitTime < b.commitTime ? -1 : a.commitTime > b.commitTime ? 1 : 0));
  // 计算本轮积分：第一名获得难度积分 D，其余按 D * (minBytes/bytes) 四舍五入到整数。
  const difficulty = typeof difficultyFromMap === 'number' ? difficultyFromMap : 100;
  const minBytes = entries.length ? entries[0].bytes : null;
  if(minBytes && Number.isFinite(minBytes) && minBytes>0){
    for(const r of entries){
      if(typeof r.bytes==='number' && r.bytes>0){
        const raw = difficulty * (minBytes / r.bytes);
        r.points = Math.round(raw);
      }else{
        r.points = 0;
      }
    }
  }else{
    for(const r of entries){ r.points = 0; }
  }
  const out = { repo: REPO, problemId, branch: getCurrentBranch(), updatedAt: new Date().toISOString(), difficulty, minBytes, ranks: entries };
  await ensureDir(DATA_DIR);
  await fs.writeFile(path.join(DATA_DIR, `prob-${problemId}.json`), JSON.stringify(out, null, 2)+"\n");
  log(`prob-${problemId}: ${entries.length} entries`);
  return out;
}

async function aggregateTotal(){
  const files = (await listFiles(DATA_DIR)).filter(f=>/^prob-\d+\.json$/.test(f)).sort();
  const byHandle = new Map();
  for(const f of files){
    const obj = JSON.parse(await fs.readFile(path.join(DATA_DIR, f), 'utf8'));
    const problemId = obj.problemId;
    for(const r of (obj.ranks||[])){
      const cur = byHandle.get(r.handle) || {handle:r.handle, rounds:0, best:Infinity, points:0};
      cur.rounds = cur.rounds + 1;
      if(typeof r.bytes === 'number' && r.bytes < cur.best){ cur.best = r.bytes; }
      const p = (typeof r.points==='number' && Number.isFinite(r.points))? r.points : 0;
      cur.points += p;
      byHandle.set(r.handle, cur);
    }
  }
  const ranks = Array.from(byHandle.values()).map(v=>({handle:v.handle, rounds:v.rounds, best: Number.isFinite(v.best)? v.best : null, points: v.points|0}));
  // 天梯榜排序：按积分降序；同分按 rounds 降序；再按 best 升序。
  ranks.sort((a,b)=> (b.points - a.points) || (b.rounds - a.rounds) || ((a.best??Infinity) - (b.best??Infinity)) );
  const out = { repo: REPO, updatedAt: new Date().toISOString(), ranks };
  await fs.writeFile(path.join(DATA_DIR, 'total.json'), JSON.stringify(out, null, 2)+"\n");
  log(`total (ladder): ${ranks.length} handles`);
  return out;
}

async function main(){
  // 1) 从环境变量读取目标轮次（兼容 WEEK），形如 "0,1,2"；
  const probEnvRaw = (process.env.PROBLEMS || process.env.WEEK || '').trim();
  let problems = probEnvRaw
    ? probEnvRaw.split(',').map(s=>parseInt(s.trim(),10)).filter(n=>!Number.isNaN(n))
    : [];
  // 2) 若未指定，则自动从 submissions/ 目录发现现有轮次（包含 week-<n> 与 <n> 两种命名，去重后升序）
  if(problems.length===0){
    const dirs = await listDirs(SUBMISSIONS);
    const ids = new Set();
    for(const d of dirs){
      const mWeek = d.match(/^week-(\d+)$/);
      const mNum = d.match(/^(\d+)$/);
      if(mWeek){ ids.add(parseInt(mWeek[1],10)); }
      else if(mNum){ ids.add(parseInt(mNum[1],10)); }
    }
    problems = Array.from(ids).sort((a,b)=>a-b);
    log('discovered problems from submissions:', problems.join(','));
  }
  if(problems.length===0){
    log('no problems discovered; nothing to do. You can set PROBLEMS=0,1,... to force.');
    return;
  }
  for(const p of problems){ await computeProblem(p); }
  await aggregateTotal();
}

main().catch(err=>{ console.error(err); process.exit(1); });
