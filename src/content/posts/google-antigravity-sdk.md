---
title: "Google Antigravity SDK: Khi bạn không cần tự build agent infrastructure từ đầu"
published: true
pubDatetime: 2026-05-21
description: "Google Antigravity SDK đóng gói production runtime của Antigravity 2.0 thành Python library — developer kế thừa toàn bộ harness và tập trung vào logic của agent, không phải plumbing."
tags:
  - "ai-agents"
  - "agentic-coding"
  - "dev-learning"
cover: "https://pub-example.r2.dev/attachments/Attachments/google-antigravity-sdk-runtime.png"
lang: "vi"
translationKey: "google-antigravity-sdk"
sourcePath: "50-Publish/Blog/Google Antigravity SDK.md"
---

![google antigravity sdk runtime](https://pub-example.r2.dev/attachments/Attachments/google-antigravity-sdk-runtime.png)

Ai cũng nghe về AI agent. Nhưng khi thực sự bắt tay vào build một cái hoạt động được trong production — không phải demo — bạn sẽ nhận ra rằng phần khó không phải là AI.

Phần khó là plumbing.

Tool management, safety policy, session persistence, lifecycle hooks, observability — tất cả những thứ này đều cần giải quyết trước khi agent của bạn có thể làm bất cứ điều gì hữu ích. Và thường thì bạn sẽ phải tự xây từ đầu, hoặc ghép lại từ nhiều thư viện khác nhau.

Google Antigravity SDK sinh ra để giải quyết đúng chỗ đó.

## 1. Đây không phải một framework mới

Điểm khác biệt quan trọng nhất của Antigravity SDK: nó không phải một abstraction layer mới được xây trên top of Gemini API. Nó là **cùng một runtime** đang chạy Antigravity 2.0 và Antigravity CLI — được đóng gói thành Python library để bạn extend với logic riêng.

Sự khác biệt nghe có vẻ nhỏ, nhưng hệ quả thực tế rất lớn.

Khi dùng một framework thông thường, bạn build infrastructure của mình rồi wire vào model. Khi dùng Antigravity SDK, bạn nhận về một production agent đã hoàn chỉnh — với tool set, safety system, session management, và observability — rồi thêm code của mình vào đó.

Và khi Google cải thiện runtime (tool execution nhanh hơn, planning tốt hơn, context management tốt hơn), agent của bạn tự hưởng lợi mà không cần rewrite.

## 2. Một agent hoạt động trong 15 dòng

```bash
pip install google-antigravity
```

```python
import asyncio
from google.antigravity import Agent, LocalAgentConfig

async def main():
    config = LocalAgentConfig()
    async with Agent(config) as agent:
        response = await agent.chat("What files are in the current directory?")
        print(await response.text())

asyncio.run(main())
```

`Agent` là một async context manager quản lý toàn bộ lifecycle: khởi tạo session, gọi tool, maintain state, cleanup. Bạn không cần quan tâm đến những thứ đó. Bạn chỉ cần `chat()`.

Ngay từ lần khởi tạo đầu tiên, agent đã có sẵn file I/O, code editing, shell execution, directory search, image generation, và sub-agent delegation. Không cần cấu hình thêm gì.

## 3. Extensibility theo 4 lớp

Khi built-in tools chưa đủ, bạn có thể mở rộng theo nhiều hướng:

- **Custom Python functions** — register bất kỳ callable nào thành tool
- **MCP servers** — kết nối bất kỳ Model Context Protocol server nào (stdio, SSE, hoặc HTTP)
- **Agent skills** — load reusable packages gồm instructions, tools, và context từ `skills_paths`
- **System instructions** — override identity và domain guidance của agent

Điều đáng chú ý: policy và hook bạn define một lần sẽ áp dụng cho tất cả tool, bất kể nguồn gốc. Bạn không phải viết lại safety logic cho từng loại tool.

## 4. Safety không phải afterthought

![google antigravity sdk safety hooks](https://pub-example.r2.dev/attachments/Attachments/google-antigravity-sdk-safety-hooks.png)

Đây là chỗ nhiều developer hay nhầm.

Mặc định, `LocalAgentConfig` cho phép mọi built-in tool — nhưng **shell execution bị deny**. Tức là agent có thể đọc file, chỉnh sửa code, tìm kiếm directory, nhưng không thể chạy lệnh shell nếu chưa được cấp quyền.

Muốn bật fully autonomous? Truyền `policies=[policy.allow_all()]`. Nhưng đây là lúc cần suy nghĩ kỹ: một agent có shell access không bị giám sát có thể làm nhiều thứ ngoài ý muốn trong production.

Khi cần kiểm soát chi tiết hơn, policy system cho phép khai báo rõ ràng:

```python
from google.antigravity.hooks.policy import deny, allow, ask_user

policies = [
    deny("*"),                                    # Block mọi tool
    allow("view_file"),                           # Trừ đọc file
    ask_user("run_command", handler=my_handler),  # Shell cần human approval
]
```

Ngoài policies, lifecycle hook system cho phép quan sát và can thiệp ở 9 điểm trong vòng đời của agent — từ session start/end, qua pre/post tool call, đến error recovery. Ba loại hook có ngữ nghĩa khác nhau: **Inspect** (read-only, non-blocking), **Decide** (blocking, approve/deny), và **Transform** (blocking, có thể sửa data in transit).

```python
from google.antigravity.hooks import post_tool_call
from google.antigravity.types import ToolResult

@post_tool_call
async def audit_log(result: ToolResult):
    print(f"Tool {result.name} completed")
```

## 5. Misconception phổ biến: "SDK = đơn giản hóa, sẽ bị giới hạn sau"

Phần lớn SDK developer tools đi theo hướng này: đơn giản lúc đầu, nhưng khi cần thứ gì đó ngoài abstraction thì bắt đầu tắc.

Antigravity SDK không theo hướng đó — ít nhất về mặt thiết kế. Vì nó là runtime thực sự, không phải wrapper, nên khả năng như streaming, sub-agents, structured output, human-in-the-loop, và session persistence đều có sẵn từ đầu, không phải add-on về sau.

Cái bạn cần cân nhắc kỹ hơn là **vendor dependency**. Model mặc định là Gemini 3.5 Flash. Swap sang provider khác không phải chuyện đơn giản. Nếu multi-provider routing là yêu cầu bắt buộc, đây không phải lựa chọn phù hợp.

Và đây đang là Research Preview: TypeScript, Go, remote harness (deploy lên Google Cloud), và Gemma integration đều chưa có.

## 6. Mental model để giữ lại

Khi bạn cài `google-antigravity` và viết `Agent(config)`, bạn không đang dùng một thư viện giúp bạn gọi model API dễ hơn. Bạn đang khởi động một production agent runtime đã được battle-tested, rồi thêm logic của mình vào đó.

Infrastructure đã có. Safety system đã có. State management đã có. Observability đã có.

Câu hỏi bạn cần tập trung trả lời là: agent của bạn nên làm gì, và khi nào cần con người can thiệp.

SDK Apache 2.0, ví dụ đi kèm gồm `getting_started/` cho từng feature riêng lẻ và `deep_dives/` cho các pattern phức tạp hơn.
