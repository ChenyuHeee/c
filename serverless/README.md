> Deprecated since v1.3.19

#（已弃用）一键参赛提交 Serverless / Deprecated One-click Submission

此能力已在 v1.3.19 中移除，不再维护。请改用常规提交流程：

1) Fork 本仓库
2) 在 `submissions/<id>/<handle>/solution.c` 写入“已加密”的参赛 JSON（由页面在 AC 后生成）
3) 发起 PR，等待 CI 更新榜单数据

如确需自建后端，请在新目录中实现，不再使用 `serverless/` 路径；建议仅将其作为历史参考从旧提交中查看。
