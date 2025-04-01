class BasePromptGenerater:
    @classmethod
    def PromptGenerate(session_data):
        # 如果 session_data['messages'] 的最后一条消息是用户发的
        if session_data['messages'][-1]['role'] == 'user':
            message = session_data['messages'][-1]['content']
            session_data['messages'].pop()
            session_data['messages'].append({
                "role": "system",
                "content": f'<用户任务>{message}</用户任务>\n\n您是 `yaa`，一个智能体。\n请根据任务内的信息，分析还需要获取哪些信息才能实事求是地解答疑问或完成任务，除非任务已完成。'
            })
        return session_data