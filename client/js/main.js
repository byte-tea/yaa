(function () {
  // 当前页面上的当前会话数据 ID
  var current_session_id = null;
  // 会话配置
  var session_config = null;
  // 客户端配置
  var client_config = new_client_config();
  // 页面布局配置
  var view_config = new_view_config();
  // 所有会话数据
  var all_session_data = [];
  // 正在处理中的会话数据 ID
  var dealing_with_id = [];

  // 清除数据
  function reset_all_data() {
    // 当前页面上的当前会话数据 ID
    current_session_id = null;
    // 会话配置
    session_config = null;
    // 客户端配置
    client_config = new_client_config();
    // 页面布局配置
    view_config = new_view_config();
    // 所有会话数据
    all_session_data = [];
    // 正在处理中的会话数据 ID
    dealing_with_id = [];
    localStorage.clear();
    save_all_session_data();
    save_configs();
    save_view_config();
    initialize();
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

  // 载入页面布局配置
  function load_view_config() {
    try {
      const viewConfig = localStorage.getItem('view_config');
      view_config = viewConfig ? JSON.parse(viewConfig) : new_view_config();
    } catch (e) {
      handle_error('载入页面布局配置时出错：', e);
    }
  }

  // 保存页面布局配置
  function save_view_config() {
    try {
      localStorage.setItem('view_config', JSON.stringify(view_config));
    } catch (e) {
      handle_error('保存页面布局配置时出错：', e);
    }
  }

  // 更新并保存页面布局配置
  function update_view_config() {
    try {
      view_config = new_view_config(
        document.querySelector('.yaa-container .sett-panel').classList.contains('closed'),
        document.querySelector('.yaa-container .ctrl-panel').classList.contains('closed'),
        document.querySelector('.yaa-container').classList.contains('not-max')
      );
      save_view_config();
    } catch (e) {
      handle_error('保存页面布局配置时出错：', e);
    }
  }

  // 显示所有会话到列表
  function view_display_session_list() {
    // 显示会话到列表
    function view_push_session(session_id, title = '', start_time, content) {
      const sessionList = document.querySelector('.yaa-container .ctrl-panel .session.list');
      const sessionDiv = document.createElement('div');
      sessionDiv.className = `session-item`;
      if (session_id === current_session_id) {
        sessionDiv.classList.add('current');
      }
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
    const sessionList = document.querySelector('.yaa-container .ctrl-panel .session.list');
    sessionList.innerHTML = '';
    for (let i = 0; i < all_session_data.length; i++) {
      const session = all_session_data[i];
      view_push_session(session.id, session.title, session.startTime, session.messages[0]?.content || '');
    }
  }

  // 切换到会话页面和数据
  function to_session(session_data) {
    try {
      if (!session_data) {
        handle_error('切换到会话页面和数据时未找到会话数据');
      }
      if (current_session_id !== session_data.id) {
        current_session_id = session_data.id;
        // 清空消息页面
        view_delete_messages();
        // 更新标题
        document.querySelector('.yaa-container .chat-panel .main-title').textContent = session_data.title;
        // 显示会话列表
        view_display_session_list();
        // 显示消息
        for (let i = 0; i < session_data.messages.length; i++) {
          const role = session_data.messages[i].role;
          const content = session_data.messages[i].content;
          var marked_content = '';
          if (role == 'user') {
            marked_content = content;
          } else {
            marked_content = marked.parse(content);
          }
          view_push_message(role, marked_content);
        }
      }
    } catch (e) {
      handle_error('切换到会话页面和数据时出错：', e);
    }
    return session_data;
  }

  // 新会话页面和数据
  function new_session(title = '会话', character = client_config.yaa_character) {
    // 生成会话数据
    function new_session_data(title = '会话', character = client_config.yaa_character) {
      return {
        'id': Date.now().toString(),
        'title': title,
        'startTime': new Date().toISOString(),
        'character': character,
        'status': "in-progress",
        'messages': []
      };
    }
    const session_data = new_session_data(title, character);
    all_session_data.push(session_data);
    save_all_session_data();
    to_session(session_data);
    return session_data;
  }

  // 取现有会话数据
  function get_session_data(session_id) {
    const index = all_session_data.findIndex(session => session.id === session_id);
    if (index !== -1) {
      return all_session_data[index];
    } else {
      handle_error('取现有会话数据时未找到会话数据');
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

  // 删除会话，更新会话列表，如果删除当前会话，则切换到最后一个会话
  function delete_session(session_id) {
    if (session_id == null) {
      handle_error('删除会话时未指定会话数据 ID');
    }
    if (get_session_data(session_id)) {
      all_session_data = all_session_data.filter(session => session.id !== session_id);
      save_all_session_data();
      view_display_session_list();
      if (all_session_data.length > 0) {
        to_session(all_session_data[all_session_data.length - 1]);
      } else {
        new_session();
      }
    } else {
      handle_error('删除会话时会话数据 ID 不存在');
    }
    if (current_session_id == session_id) {
      current_session_id = null;
      view_delete_messages();
    }
  }

  // 删除显示会话列表中的会话
  function view_delete_session(sessionDelBtn) {
    sessionDelBtn.parentElement.remove();
  }

  // 删除显示的消息记录
  function view_delete_messages() {
    document.querySelector('.yaa-container .chat-panel .main-title').textContent = '';
    const chatContent = document.querySelector('.yaa-container .chat-panel .content .width-768');
    chatContent.innerHTML = '';
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

  // 应用页面布局
  function view_apply_view_config() {
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
  function save_settings() {
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
    var session_data = null;
    // 判断是否从新会话发送消息
    if (current_session_id == null) {
      // 如果当前页面没显示会话（是从新建会话发送消息的）
      session_data = new_session(title = input.value);
      // 标记当前会话正在处理中
      dealing_with(session_data.id);
    } else {
      // 如果当前页面显示会话（是从会话列表发送消息的）
      if (is_dealing_with(current_session_id)) {
        handle_error('当前会话正在处理中，请稍后再试');
      }
      if (get_session_data(current_session_id)) {
        session_data = get_session_data(current_session_id);
      } else {
        handle_error('当前会话数据不存在');
      }
      // 标记当前会话正在处理中
      dealing_with(session_data.id);
    }
    // 更新会话数据
    session_data.messages.push({
      'role': 'user',
      'content': input.value
    });
    view_push_message(role = 'user', marked_content = input.value);
    update_session_data(session_data);
    input.value = '';
    try {
      // 发送请求
      var post_data = session_data;
      if (session_config != null) {
        post_data.config = session_config
      }
      const response = await fetch(client_config.yaa_api, {
        method: 'POST',
        headers: { 'Authorization': 'YAA-API-KEY ' + client_config.yaa_api_key, 'Content-Type': 'application/json' },
        body: JSON.stringify(post_data)
      }); post_data = null;
      const data = await response.json();
      console.log('请求回应：', data.messages);
      // 更新会话数据的状态
      if (data.finish_reason == 'waiting_feedback' || data.finish_reason == 'interrupted') {
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
        if (session_data.id === current_session_id) {
          view_push_message(data.messages[i].role, marked.parse(data.messages[i].content));
        }
      }
    } catch (e) {
      handle_error('解析消息时出错：' + e);
    } finally {
      // 标记停止处理会话
      stop_dealing_with(session_data.id);
    }
  }

  // 错误信息处理
  function handle_error(e) {
    const message = '客户端错误：' + e;
    console.error(message);
    view_push_message('system', message);
    throw new Error(message);
  }

  // 初始化 mermaid 图表
  function initialize_mermaid() {
    mermaid.init({ noteMargin: 10 }, '.language-mermaid');
  }

  // 初始化
  function initialize() {
    load_configs();
    load_all_session_data();
    load_view_config();
    view_apply_view_config();
    view_display_config();
    initialize_mermaid();
    if (all_session_data.length > 0) {
      to_session(all_session_data[all_session_data.length - 1]);
    } else {
      new_session();
    }
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
      to_session(get_session_data(session_id));
    } else if (event.target.closest('.yaa-container .chat-panel .header .maximize')) {
      toggle_maximize();
      update_view_config();
    } else if (event.target.closest('.yaa-container .chat-panel .header .menu, .yaa-container .yaa')) {
      toggle_ctrl_panel();
      update_view_config();
    } else if (event.target.closest('.yaa-container .chat-panel .header .reload')) {
      reload_all();
    } else if (event.target.closest('.yaa-container .chat-panel .input .back-bottom')) {
      to_bottom();
    } else if (event.target.closest('.yaa-container .ctrl-panel .btn-new')) {
      new_session();
    } else if (event.target.closest('.yaa-container .ctrl-panel .btn-settings')) {
      toggle_sett_panel();
      update_view_config();
    } else if (event.target.closest('.yaa-container .ctrl-panel .btn-about')) {
      window.open('https://github.com/Byte-tea/yaa', '_blank');
    } else if (event.target.closest('.yaa-container .chat-panel .input .send-message')) {
      send_message_and_deal_with_api();
    } else if (event.target.closest('.yaa-container .sett-panel .header .save-settings')) {
      save_settings();
    } else if (event.target.closest('.yaa-container .sett-panel .header .download-settings')) {
      // TODO
    } else if (event.target.closest('.yaa-container .sett-panel .header .upload-settings')) {
      // TODO
    } else if (event.target.closest('.yaa-container .sett-panel .sett-block .btn-clear.data')) {
      if (confirm('确认要清空所有数据？')) {
        reset_all_data();
      }
    } else if (event.target.closest('.yaa-container .sett-panel .sett-block .btn-clear.sessions')) {
      if (confirm('确认要清空所有会话？')) {
        // TODO
      }
    }
  });
  // 网页加载完毕后触发初始化
  window.addEventListener('DOMContentLoaded', () => initialize());
})();