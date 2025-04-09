(function () {
  // 当前页面上的当前会话数据 ID
  var current_session_id = null;
  // 会话配置
  var session_config = null;
  var client_config = new_client_config();
  var view_config = new_view_config();
  var all_session_data = [];
  var dealing_with_id = [];

  // 清除数据
  function reset_all_data() {
    current_session_id = null;
    session_config = null;
    client_config = new_client_config();
    all_session_data = [];
    dealing_with_id = [];
    save_all_session_data();
    save_configs();
  }

  // 检查处理列表
  function is_dealing_with(session_id) {
    return dealing_with_id.includes(session_id);
  }

  // 加入处理列表
  function dealing_with(session_id) {
    if (!is_dealing_with(session_id)) {
      dealing_with_id.push(session_id);
    } else {
      console.warn('加入处理列表时会话数据 ID 已存在：', session_id);
    }
  }

  // 离开处理列表
  function stop_dealing_with(session_id) {
    if (is_dealing_with(session_id)) {
      dealing_with_id = dealing_with_id.filter(id => id !== session_id);
    } else {
      console.warn('离开处理列表时会话数据 ID 不存在：', session_id);
    }
  }

  // 载入所有会话数据
  function load_all_session_data() {
    try {
      const saved = localStorage.getItem('all_session_data');
      all_session_data = saved ? JSON.parse(saved) : [];
    } catch (error) {
      handle_error('载入所有会话数据时出错：', error);
    }
  }

  // 保存所有会话数据
  function save_all_session_data() {
    try {
      localStorage.setItem('all_session_data', JSON.stringify(all_session_data));
    } catch (e) {
      handle_error('保存所有会话数据时出错：', e);
    }
  }

  // 载入设置数据
  function load_configs() {
    try {
      const savedConfig = localStorage.getItem('session_config');
      session_config = savedConfig ? JSON.parse(savedConfig) : null;

      const clientConfig = localStorage.getItem('client_config');
      client_config = clientConfig ? JSON.parse(clientConfig) : new_client_config();
    } catch (e) {
      handle_error('载入所有会话数据时出错：', e);
    }
  }

  // 保存设置数据
  function save_configs() {
    try {
      localStorage.setItem('session_config', JSON.stringify(session_config));
      localStorage.setItem('client_config', JSON.stringify(client_config));
    } catch (e) {
      handle_error('保存设置数据时出错：', e);
    }
  }

  // 生成会话数据
  function new_session_data(content, title = '', character = client_config.yaa_character) {
    var session_data = {
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
    return session_data;
  }

  // 取现有会话数据
  function get_session_data(session_id) {
    const index = all_session_data.findIndex(session => session.id === session_id);
    if (index !== -1) {
      return all_session_data[index];
    } else {
      handle_error('取现有会话数据时未找到会话数据');
      return null;
    }
  }

  // 更新现有会话数据到所有会话数据
  function update_session_data(session_data) {
    if (session_data) {
      const index = all_session_data.findIndex(session => session.id === session_data.id);
      if (index !== -1) {
        // 如果找到，则更新会话数据
        all_session_data[index] = session_data;
      } else {
        // 如果未找到，则添加会话数据
        all_session_data.push(session_data);
      }
    }
    save_all_session_data();
  }

  // 生成客户端配置
  function new_client_config(
    yaa_api = 'http://127.0.0.1:12345',
    yaa_api_key = '',
    yaa_character = '你是一个叫 yaa 的智能体。'
  ) {
    return {
      'yaa_api': yaa_api,
      'yaa_api_key': yaa_api_key,
      'yaa_character': yaa_character
    }
  }

  // 生成页面布局配置
  function new_view_config(
    sett_panel_closed = true,
    ctrl_panel_closed = false,
    not_max = false
  ) {
    return {
      'sett_panel_closed': sett_panel_closed,
      'ctrl_panel_closed': ctrl_panel_closed,
      'not_max': not_max
    }
  }

  // 生成配置数据
  function new_session_config(api_url = 'https://api.deepseek.com', api_key, model_name = 'deepseek-chat') {
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
        handle_error('添加新消息到会话时未指定会话数据 ID');
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
      handle_error('添加新消息到会话时未找到会话数据 ID');
      return;
    }
  }

  // 删除会话
  function delete_session(session_id) {
    if (session_id == null) {
      handle_error('删除会话时未指定会话数据 ID');
      return;
    }
    if (get_session_data(session_id)) {
      all_session_data = all_session_data.filter(session => session.id !== session_id);
      save_all_session_data();
    } else {
      handle_error('删除会话时会话数据 ID 不存在');
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

    configContainer.querySelector('.yaa-api').value = client_config.yaa_api;
    configContainer.querySelector('.yaa-api-key').value = client_config.yaa_api_key;
    configContainer.querySelector('.yaa-character').value = client_config.yaa_character;
    if (session_config) {
      configContainer.querySelector('.api-url').value = session_config.llm_api.provider.api_url;
      configContainer.querySelector('.api-key').value = session_config.llm_api.provider.api_key;
      configContainer.querySelector('.model-name').value = session_config.llm_api.provider.model_name;
    }
  }

  function view_display_session_list() {
    for (let i = 0; i < all_session_data.length; i++) {
      const session = all_session_data[i];
      view_push_session(session);
    }
  }

  // 显示指定会话
  function view_switch_session(session_id) {
    if (!session_id) {
      handle_error('显示指定会话时未指定会话数据 ID');
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
      handle_error('显示指定会话时会话数据 ID 不存在');
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

  // 应用页面布局
  function view_display_view_config() {
    if (view_config.not_max) {
      toggle_maximize();
    }
    if (!view_config.sett_panel_closed) {
      toggle_sett_panel();
    }
    if (view_config.ctrl_panel_closed) {
      toggle_ctrl_panel();
    }
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
    view_config.ctrl_panel_closed = controlPanel.classList.contains('closed');
  }

  // 切换设置面板显示状态
  function toggle_sett_panel() {
    const settingsPanel = document.querySelector('.yaa-container .sett-panel');
    view_display_config();
    settingsPanel.classList.toggle('closed');
    view_config.ctrl_panel_closed = settingsPanel.classList.contains('closed');
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
    session_config = new_session_config(llmApiUrl, llmApiKey, model);
    client_config = new_client_config(yaaApiInput, yaaApiKeyInput, yaaCharacterInput);

    // 保存配置到本地存储
    save_configs();
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
    var session_data = null;
    // 判断是否从新会话发送消息
    if (current_session_id == null) {
      // 如果当前页面没显示会话（是从新建会话发送消息的）
      view_delete_messages()
      session_data = new_session_data(content = input.value, title = input.value);
      document.querySelector('.yaa-container .chat-panel .main-title').textContent = input.value;
      current_session_id = session_data.id;
      session_id = session_data.id;
      // 标记当前会话正在处理中
      dealing_with(session_id);
      view_push_session(session_id = session_data.id, session_data.title, session_data.startTime, input.value);
    } else {
      // 如果当前页面显示会话（是从会话列表发送消息的）
      session_id = current_session_id;
      if (is_dealing_with(session_id)) {
        handle_error('当前会话正在处理中，请稍后再试');
        return;
      }
      if (get_session_data(session_id)) {
        session_data = get_session_data(session_id);
      } else {
        handle_error('当前会话数据不存在');
        return;
      }
      // 标记当前会话正在处理中
      dealing_with(session_id);
      // 更新会话数据
      session_data.messages.push({
        'role': 'user',
        'content': input.value
      });
    }
    view_push_message(role = 'user', marked_content = input.value);
    update_session_data(session_data);
    input.value = '';
    try {
      // 发送请求
      var post_data = session_data;
      post_data.config = session_config;
      const response = await fetch(client_config.yaa_api, {
        method: 'POST',
        headers: { 'Authorization': 'YAA-API-KEY ' + client_config.yaa_api_key, 'Content-Type': 'application/json' },
        body: JSON.stringify(post_data)
      }); post_data = null;
      const data = await response.json();
      console.log('请求回应：', data.messages);
      // 更新会话数据的状态
      if (data.finish_reason == 'waiting_feedback' || data.finish_reason == 'interrupted') {
        session_data = get_session_data(session_id);
        session_data.status = 'interrupted';
        update_session_data(session_data)
      }
      // 遍历消息，更新会话数据，并显示消息
      for (var i = 0; i < data.messages.length; ++i) {
        session_data.messages.push({
          'role': data.messages[i].role,
          'content': data.messages[i].content
        });
        update_session_data(session_data)
        if (session_id == current_session_id) {
          view_push_message(data.messages[i].role, marked.parse(data.messages[i].content));
        }
      }
    } catch (e) {
      handle_error('解析消息时出错：' + e);
    } finally {
      // 标记停止处理会话
      stop_dealing_with(session_id);
    }
  }

  // 错误信息处理
  function handle_error(e) {
    console.error('客户端错误：' + e);
    view_push_message('system', '客户端错误：' + e);
  }

  // 初始化
  function initialize() {
    load_configs();
    view_display_view_config();
    load_all_session_data();
    view_display_config();
    view_display_session_list();
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
      view_config.not_max = yaaContainer.classList.contains('not-max');
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
    } else if (event.target.closest('.yaa-container .sett-panel .header .download-settings')) {
      // TODO
    } else if (event.target.closest('.yaa-container .sett-panel .header .upload-settings')) {
      // TODO
    } else if (event.target.closest('.yaa-container .sett-panel .sett-block .btn-clear-data')) {
      if (confirm('确认要清空所有数据？')) {
        reset_all_data();
        view_new_session();
        view_display_session_list();
      }
    }
  });
  // 网页加载完毕后触发初始化
  window.addEventListener('DOMContentLoaded', () => initialize());
})();