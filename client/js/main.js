(function () {
  var current_session_id = null;
  var current_config = null;
  var yaa_api = 'http://127.0.0.1:12345';
  var yaa_api_key = '';
  var yaa_character = "你是一个叫 yaa 的智能体。";
  var all_session_data = [];

  // 载入所有会话数据
  function load_all_session_data() {
    try {
      const saved = localStorage.getItem('all_session_data');
      all_session_data = saved ? JSON.parse(saved) : [];
    } catch (error) {
      error('载入所有会话数据时出错：', error);
    }
  }

  // 保存所有会话数据
  function save_all_session_data() {
    try {
      localStorage.setItem('all_session_data', JSON.stringify(all_session_data));
    } catch (error) {
      error('保存所有会话数据时出错：', error);
    }
  }

  // 载入设置数据
  function load_config_data() {
    try {
      const savedConfig = localStorage.getItem('config_data');
      current_config = savedConfig ? JSON.parse(savedConfig) : null;

      const yaaApi = localStorage.getItem('yaa_api');
      if (yaaApi) {
        yaa_api = yaaApi;
      }

      const yaaApiKey = localStorage.getItem('yaa_api_key');
      if (yaaApiKey) {
        yaa_api_key = yaaApiKey;
      }

      const yaaCharacter = localStorage.getItem('yaa_character');
      if (yaaCharacter) {
        yaa_character = yaaCharacter;
      }
    } catch (error) {
      error('载入所有会话数据时出错：', error);
    }
  }

  // 保存设置数据
  function save_config_data() {
    try {
      localStorage.setItem('config_data', JSON.stringify(current_config));
      localStorage.setItem('yaa_api', yaa_api);
      localStorage.setItem('yaa_api_key', yaa_api_key);
      localStorage.setItem('yaa_character', yaa_character);
    } catch (error) {
      error('保存设置数据时出错：', error);
    }
  }

  // 生成会话数据
  function new_session_data(content, title = '', character = yaa_character) {
    return {
      'id': Date.now().toString(),
      'title': title,
      'startTime': new Date().toISOString(),
      'character': character,
      'status': "in-progress",
      'messages': [
        {
          'role': 'user',
          'content': content
        }
      ]
    }
  }

  // 取现有会话数据
  function get_session_data(session_id) {
    return all_session_data.find(session => session.id === session_id);
  }

  // 更新现有会话数据到所有会话数据
  function update_session_data(session_data) {
    if (session_data) {
      const index = all_session_data.findIndex(session => session.id === session_data.id);
      if (index !== -1) {
        all_session_data[index] = session_data;
      } else {
        all_session_data.push(session_data);
      }
    }
    save_all_session_data();
  }

  // 生成配置数据
  function new_config_data(api_url = 'https://api.deepseek.com', api_key, model_name = 'deepseek-chat') {
    return {
      'llm_api': {
        'provider': {
          'api_url': api_url,
          'api_key': api_key,
          'model_name': model_name
        }
      }
    }
  }

  // 添加新消息到会话
  function push_message(role, content, session_id = null) {
    if (session_id == null) {
      if (current_session_id == null) {
        error('添加新消息到会话时未指定会话数据 ID');
        return;
      }
      session_id = current_session_id;
    }
    if (get_session_data(session_id)) {
      var session_data = get_session_data(session_id);
      session_data.messages.push({
        'role': role,
        'content': content
      });
      update_session_data(session_data)
    } else {
      error('添加新消息到会话时未找到会话数据 ID');
      return;
    }
  }

  // 删除会话
  function delete_session(session_id) {
    if (session_id == null) {
      error('删除会话时未指定会话数据 ID');
      return;
    }
    if (get_session_data(session_id)) {
      all_session_data = all_session_data.filter(session => session.id !== session_id);
      save_all_session_data();
    } else {
      error('删除会话时会话数据 ID 不存在');
    }
    if (current_session_id == session_id) {
      view_delete_messages();
    }
  }

  // 删除显示会话列表中的会话
  function view_delete_session(sessionDelBtn) {
    sessionDelBtn.parentElement.remove();
  }

  // 删除显示的消息记录
  function view_delete_messages() {
    current_session_id = null;
    document.querySelector('.yaa-container .chat-panel .main-title').textContent = '';
    const chatContent = document.querySelector('.yaa-container .chat-panel .content .width-768');
    chatContent.innerHTML = '';
  }

  // 显示新会话
  function view_new_session() {
    view_delete_messages();
  }

  // 显示当前设置
  function view_display_config() {
    const configContainer = document.querySelector('.yaa-container .sett-panel .sett-block');

    configContainer.querySelector('.yaa-api').value = yaa_api;
    configContainer.querySelector('.yaa-api-key').value = yaa_api_key;
    configContainer.querySelector('.yaa-character').value = yaa_character;
    if (current_config) {
      configContainer.querySelector('.api-url').value = current_config.llm_api.provider.api_url;
      configContainer.querySelector('.api-key').value = current_config.llm_api.provider.api_key;
      configContainer.querySelector('.model-name').value = current_config.llm_api.provider.model_name;
    }
  }

  // 显示指定会话
  function view_switch_session(session_id) {
    if (!session_id) {
      error('显示指定会话时未指定会话数据 ID');
      return;
    }
    if (get_session_data(session_id)) {
      document.querySelector('.yaa-container .chat-panel .content .width-768').innerHTML = '';
      const session = get_session_data(session_id);
      document.querySelector('.yaa-container .chat-panel .main-title').textContent = session.title;
      for (let i = 0; i < session.messages.length; i++) {
        const role = session.messages[i].role;
        const content = session.messages[i].content;
        var marked_content = '';
        if (role == 'user') {
          marked_content = content;
        } else {
          marked_content = marked.parse(content);
        }
        view_push_message(role, marked_content);
      }
      current_session_id = session_id;
    } else {
      error('显示指定会话时会话数据 ID 不存在');
      return;
    }
  }

  // 显示会话到列表
  function view_push_session(session_id, title = '', start_time, content) {
    const sessionList = document.querySelector('.yaa-container .ctrl-panel .session.list');
    const sessionDiv = document.createElement('div');
    sessionDiv.className = `session-item`;
    sessionDiv.innerHTML = `
      <div class="session-info">
        <strong>${title}</strong>
        <div class="session-item-content">${content}</div>
        <div class="session-item-time">${start_time}</div>
      </div>
      <button data-id="${session_id}" class="delete-session-btn delete icon"></button>
    `;
    sessionList.appendChild(sessionDiv);
  }

  // 显示新消息，如果离底部很近（10px），触发回到底部
  function view_push_message(role, marked_content, model_name = '') {
    const chatContent = document.querySelector('.yaa-container .chat-panel .content .width-768');
    const messageDiv = document.createElement('div');
    messageDiv.className = `object ${role}`;
    messageDiv.innerHTML = `
      <div class="avatar" title="${model_name}"></div>
      <div class="bubble">
        ${marked_content}
      </div>
    `;
    messageDiv.querySelector('.avatar').classList.add(role);
    messageDiv.querySelector('.bubble').classList.add(role);
    chatContent.appendChild(messageDiv);

    // const distanceFromBottom = chatContent.scrollHeight - chatContent.scrollTop - chatContent.clientHeight;
    // if (distanceFromBottom <= 10) {
    //   to_bottom();
    // }
  }

  // 最大化
  function toggle_maximize() {
    const yaaContainer = document.querySelector('.yaa-container');
    yaaContainer.classList.toggle('not-max');
  }

  // 切换控制面板显示状态
  function toggle_ctrl_panel() {
    const controlPanel = document.querySelector('.yaa-container .ctrl-panel');
    const settingsPanel = document.querySelector('.yaa-container .sett-panel');
    if (!settingsPanel.classList.contains('closed')) {
      settingsPanel.classList.toggle('closed');
    }
    controlPanel.classList.toggle('closed');
  }

  // 切换设置面板显示状态
  function toggle_sett_panel() {
    const settingsPanel = document.querySelector('.yaa-container .sett-panel');
    settingsPanel.classList.toggle('closed');
  }

  // 回到最底
  function to_bottom() {
    const chatContent = document.querySelector('.yaa-container .chat-panel .content');
    chatContent.scrollTo({
      top: chatContent.scrollHeight,
      behavior: 'smooth'
    })
  }

  // 按下保存设置按钮
  function toggle_save_settings() {
    const settingsPanel = document.querySelector('.yaa-container .sett-panel');
    if (settingsPanel.classList.contains('closed')) {
      console.warn('保存设置按钮在面板关闭时被按下')
      return;
    }
    // 获取设置面板输入值
    const yaaApiInput = settingsPanel.querySelector('.yaa-api').value;
    const yaaApiKeyInput = settingsPanel.querySelector('.yaa-api-key').value;
    const yaaCharacterInput = settingsPanel.querySelector('.yaa-character').value;
    const llmApiUrl = settingsPanel.querySelector('.api-url').value;
    const llmApiKey = settingsPanel.querySelector('.api-key').value;
    const model = settingsPanel.querySelector('.model-name').value;

    // 应用新配置
    current_config = new_config_data(llmApiUrl, llmApiKey, model);
    yaa_api = yaaApiInput;
    yaa_api_key = yaaApiKeyInput;
    yaa_character = yaaCharacterInput;

    // 保存配置到本地存储
    save_config_data();
  }

  // 重载
  function reload_all() {
    var userConfirmed = confirm('确认要重载？');
    if (userConfirmed) {
      location.reload();
    }
  }

  // 发送消息
  async function send_message_and_deal_with_api() {
    const input = document.querySelector('.yaa-container .chat-panel .input textarea');
    if (input.value.trim() === '') {
      return;
    }
    var session_id = null;
    if (current_session_id == null) {
      view_delete_messages()
      const session_data = new_session_data(content = input.value, title = input.value);
      current_session_id = session_data.id;
      session_id = session_data.id;
      update_session_data(session_data);
      view_push_session(session_id = session_data.id, session_data.title, session_data.startTime, input.value);
    } else {
      session_id = current_session_id;
    }
    input.value = '';
    try {
      const response = await fetch(yaa_api, {
        method: 'POST',
        headers: { 'Authorzation': 'YAA-API-KEY ' + yaa_api_key, 'Content-Type': 'application/json' },
        body: JSON.stringify(get_session_data(session_id))
      });
      const data = await response.json();
      if (data.finish_reason == 'waiting_feedback' || data.finish_reason == 'interrupted') {
        var session_data = get_session_data(session_id);
        session_data.status = 'interrupted';
        update_session_data(session_data)
      }
      for (var i = 0; i < data.messages.length; ++i) {
        const role = data.messages[i].role;
        const content = data.messages[i].content;
        var session_data = get_session_data(session_id);
        session_data.messages.push({
          'role': role,
          'content': content
        });
        update_session_data(session_data)
        if (session_id == current_session_id) {
          view_push_message(role, marked.parse(content));
        }
      }
    } catch (e) {
      error('解析消息时出错：' + e);
    }
    save_all_session_data()
  }

  // 错误信息处理
  function error(e) {
    console.error('客户端错误：' + e);
    view_push_message('system', '客户端错误：' + e);
  }

  // 初始化
  function initialize() {
    load_config_data();
    load_all_session_data();
    view_display_config()
  }

  // 点击事件委托
  document.addEventListener('click', function (event) {
    const imgOrSvg = event.target.closest('.yaa-container .chat-panel .content .object .bubble img, .yaa-container .chat-panel .content .object .bubble svg');
    const sessionDelBtn = event.target.closest('.yaa-container .ctrl-panel .session.list .session-item .delete-session-btn');
    const sessionItem = event.target.closest('.yaa-container .ctrl-panel .session.list .session-item');
    if (imgOrSvg) {
      const url = imgOrSvg.getAttribute('src') || imgOrSvg.getAttribute('xlink:href');
      if (url) {
        window.open(url, '_blank');
        event.preventDefault();
        return;
      } else {
        const newWindow = window.open('', '_blank');
        newWindow.document.body.innerHTML = imgOrSvg.outerHTML;
        newWindow.document.close();
        event.preventDefault();
        return;
      }
    } else if (sessionDelBtn) {
      const session_id = sessionDelBtn.getAttribute('data-id');
      if (confirm('确认要删除会话？')) {
        delete_session(session_id);
        view_delete_session(sessionDelBtn);
      }
    } else if (sessionItem) {
      const session_id = sessionItem.querySelector('.delete-session-btn').getAttribute('data-id');
      view_switch_session(session_id);
    } else if (event.target.closest('.yaa-container .chat-panel .header .maximize')) {
      toggle_maximize();
    } else if (event.target.closest('.yaa-container .chat-panel .header .menu, .yaa-container .yaa')) {
      toggle_ctrl_panel();
    } else if (event.target.closest('.yaa-container .chat-panel .header .reload')) {
      reload_all();
    } else if (event.target.closest('.yaa-container .chat-panel .input .back-bottom')) {
      to_bottom();
    } else if (event.target.closest('.yaa-container .ctrl-panel .btn-new')) {
      view_new_session();
    } else if (event.target.closest('.yaa-container .ctrl-panel .btn-settings')) {
      toggle_sett_panel();
    } else if (event.target.closest('.yaa-container .ctrl-panel .btn-about')) {
      window.open('https://github.com/Byte-tea/yaa', '_blank');
    } else if (event.target.closest('.yaa-container .chat-panel .input .send-message')) {
      send_message_and_deal_with_api();
    } else if (event.target.closest('.yaa-container .sett-panel .header .save-settings')) {
      toggle_save_settings();
    }
  });
  // 网页加载完毕后触发初始化
  window.addEventListener('DOMContentLoaded', () => initialize());
})();