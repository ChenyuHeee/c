# Submissions Guide / 提交指南

## Structure / 目录结构
```
submissions/
  week-1/
    <handle>/
      solution.c
      README.md (optional)
  week-2/ (future)
    <handle>/
      solution.c
```

## Steps (EN)
1. Fork this repository.
2. Create your handle folder under `submissions/week-1/` (e.g. `submissions/week-1/alice/`).
3. Add a C source file named **`solution.c`** (filename must be exactly `solution.c`). Must read from stdin and write to stdout.
4. Open a Pull Request to `main`.
5. The PR will be automatically validated, compiled, and merged if all checks pass.
6. After merge, CI updates JSON leaderboards: `competition/data/week-1.json` and `competition/data/total.json`.
7. Update by overwriting the same file; earliest commit time used for tie-break.

## 步骤 (ZH)
1. Fork 本仓库。
2. 在 `submissions/week-1/` 下新建以自己昵称命名的目录，例如 `submissions/week-1/alice/`。
3. 添加一个名为 **`solution.c`** 的 C 源文件（文件名必须为 `solution.c`），程序需从标准输入读取并向标准输出打印结果。
4. 发起 PR 到 `main`。
5. PR 会自动验证、编译，如果所有检查通过则自动合并。
6. 合并后 CI 会更新排行榜 JSON：`competition/data/week-1.json` 与 `competition/data/total.json`。
7. 通过覆盖同一路径文件来更新提交；相同字节数时按提交时间先后排名。

## Rules / 规则
- The filename **must** be `solution.c` (not any other .c filename).
- Only one `.c` file per PR is counted for ranking.
- Path format: `submissions/week-<n>/<handle>/solution.c`
- UTF-8 byte length for ranking (`wc -c`).
- No undefined behavior, no file I/O, no non‑standard libraries.
- Standard headers allowed.
- Anonymous handle 'anon' is not allowed.

## Auto-Merge / 自动合并
PRs are automatically merged if:
- File path is `submissions/week-<n>/<handle>/solution.c` or `submissions/week-<n>/<handle>/README.md`
- Code compiles successfully with `gcc -std=c11 -O2`
- No 'hold' or 'no-auto-merge' labels are present
- PR is not in draft state
- Handle is not 'anon'

PR 将在以下情况下自动合并：
- 文件路径为 `submissions/week-<n>/<handle>/solution.c` 或 `submissions/week-<n>/<handle>/README.md`
- 代码使用 `gcc -std=c11 -O2` 编译成功
- 没有 'hold' 或 'no-auto-merge' 标签
- PR 不是草稿状态
- Handle 不是 'anon'

## Future Weeks / 未来周次
When week-2 starts, create `submissions/week-2/<handle>/solution.c`. Script can be extended with `WEEK='1,2'`.
