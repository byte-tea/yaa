# 工具基类模块
#
# 职责：
# 1. 定义工具调用的统一接口
# 2. 提供参数验证和资源限制基础功能
# 3. 标准化工具执行结果格式
#
# 工具实现规范：
# - 每个工具必须继承BaseTool
# - 实现execute()方法执行核心逻辑
# - 定义input_schema参数验证规则
# - 声明required_resources资源需求
#
# 执行流程：
# 1. 验证输入参数是否符合schema
# 2. 检查资源配额是否充足
# 3. 执行工具核心逻辑
# 4. 格式化返回结果
# 5. 清理占用资源
#
# 示例工具定义：
# class ExampleTool(BaseTool):
#     input_schema = {
#         'param1': {'type': 'string', 'required': True}
#     }
#
#     def execute(self, params):
#         # 工具逻辑实现
#         return {'result': data}
#
# 与其他模块关系：
# - 被BaseAgent调用来执行具体工具
# - 受Auth模块的资源限制约束
# - 执行结果返回给Prompt模块生成后续提示