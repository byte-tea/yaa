# 项目架构

yaa 智能体是前后端分离的，前端使用 HTML + CSS + JS，后端使用 Python。

> 目前项目正在开发中，开发者可以参考 [OpenManus 的智能体框架架构图](openManus.md)和 [Roo Code 的工作流程图](RooCode.md)。

## 构思

### 前端

提供用户界面，存储会话历史、存储配置、存储提示词。

### 后端

智能体实现、工具使用（函数调用）实现、运行会话、缺省时提供默认配置、缺省时提供默认提示词。

### 整体架构图

```mermaid
%% yaa 智能体框架架构图
flowchart TD
    subgraph FRONTEND[前端]
        HIST[会话历史和状态] --> |读取| FE[用户界面]
        FE --> |创建任务| SESSION[会话交互管理器]
        SESSION --> |保存| HIST[会话历史和状态]
        FE --> |配置| CFG[配置管理]
        FE --> |定义| PROMPT[提示词库]
    end

    subgraph BACKEND[后端]
        SESSION --> |创建智能体实例| TASK{分析并确定任务目标}
        AUTO_RETRY --> |否| BREAKER
        BREAKER --> |会话历史和中断类型| SESSION
        AGENT --> |实时同步状态（流式传输）| SESSION

        subgraph AGENT[智能体]
            TASK --> PROMPT_GEN[提示词生成组合器]
            PROMPT_GEN -->|提示词| API_SERVICE[大语言模型 API]
            API_SERVICE --> |API 出错| AUTO_RETRY{是否自动重试？}
            AUTO_RETRY --> |是| API_SERVICE
            API_SERVICE -->|流式响应| TOOL_DETECTOR{是否调用工具函数？}
            TOOL_DETECTOR -->|是| APPROVE{是否已由用户自动授权？}
            TOOL_DETECTOR --> |否| FINISH_DETECTOR{是否完成任务？}
            FINISH_DETECTOR --> |是| BREAKER{中断管理}
            FINISH_DETECTOR --> |否| BREAKER{中断管理}
            APPROVE --> |是| TOOL_EXEC[工具执行器]
            APPROVE --> |否| BREAKER
            TOOL_EXEC -->|工具结果| PROMPT_GEN
        end
    end
```

### 工具调用安全机制

```mermaid
%% yaa 工具调用安全机制图
sequenceDiagram
    用户 ->> 权限验证器: 发起工具调用请求（携带工具ID和参数）
    用户 ->> 日志记录器: 记录原始请求
    权限验证器 ->> 用户: 验证身份凭证（如Token有效性）
    权限验证器 ->> 权限数据库: 检查用户对工具的访问权限
    权限数据库 -->> 权限验证器: 返回权限状态
    权限验证器 ->> 参数过滤器: 传递工具参数进行验证
    参数过滤器 ->> 正则匹配器: 检查参数是否符合安全格式
    正则匹配器 -->> 参数过滤器: 返回验证结果
    参数过滤器 -->> 权限验证器: 抛出异常/返回清理后的参数
    权限验证器 ->> 工具执行沙箱: 安全启动工具执行环境
    工具执行沙箱 ->> 资源限制器: 设置CPU/内存使用上限
    工具执行沙箱 ->> 工具进程: 执行工具逻辑
    工具进程 ->> 中断监控器: 发送执行进度
    中断监控器 ->> 权限验证器: 报告异常或超时
    权限验证器 ->> 用户: 返回执行结果或安全警报
    工具执行沙箱 ->> 日志记录器: 记录执行过程审计日志
```
