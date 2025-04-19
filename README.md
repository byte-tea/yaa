<h1 align="center">
  <a href="https://github.com/Byte-tea/yaa/">
    <img src="assets/yaa.svg" width="150" height="150" alt="banner" /><br>
  </a>
</h1>

<p align="center">中文 | <a href="README.en.md">English</a></p>

## yaa

`yaa` 的意思是 Yet Another Agent。是一个能分析理解自然语言指示，自动创建、规划、执行、验证任务的智能体。

## 快速上手

### 客户端

[查看](client/index.html)

### 服务端

#### 部署

拉取到本地：

```bash
# 拉取项目仓库到本地
git clone https://github.com/Byte-tea/yaa.git
# 进入项目目录
cd yaa
```

配置：

```bash
# 创建客户端相关配置文件，传入时会覆盖默认配置
cp configs/Config.example.json Config.json
# 创建服务端相关配置文件，传入时会覆盖默认配置
cp configs/ServerConfig.example.json ServerConfig.json
```

#### 使用

以服务模式启动：

```bash
cargo run --release -- --serve --port 12345 --config Config.json
```

以命令行交互模式启动：

```bash
cargo run --release -- --config Config.json
> 请用 Python 写一个冒泡排序算法。
* 好的……
```

## 贡献

详见 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 项目实现

详见 [yaa 文档](docs/README.md)。

## 许可证

[MIT License](LICENSE)

## 附加许可证

### 客户端依赖

|名称|协议|
|:-:|:--|
|tabler-icons|[MIT License](//mit-license.org)|
|markedjs/marked|[marked License](https://github.com/markedjs/marked/blob/master/LICENSE.md)|
|mermaidjs/mermaid|[MIT License](https://github.com/mermaid-js/mermaid/blob/develop/LICENSE)|

### 服务端依赖

|名称|协议|
|:-:|:--|
|actix-cors|[MIT License](https://github.com/actix/actix-extras/blob/master/LICENSE-MIT)|
|actix-web|[MIT License](https://github.com/actix/actix-web/blob/master/LICENSE-MIT)|
|anyhow|[MIT License](https://github.com/dtolnay/anyhow/blob/master/LICENSE-MIT)|
|async-trait|[MIT License](https://github.com/dtolnay/async-trait/blob/master/LICENSE-MIT)|
|chrono|[MIT License](https://github.com/chronotope/chrono/blob/main/LICENSE)|
|clap|[MIT License](https://github.com/clap-rs/clap/blob/master/LICENSE-MIT)|
|reqwest|[MIT License](https://github.com/seanmonstar/reqwest/blob/master/LICENSE-MIT)|
|serde|[MIT License](https://github.com/serde-rs/serde/blob/master/LICENSE-MIT)|
|serde_json|[MIT License](https://github.com/serde-rs/json/blob/master/LICENSE-MIT)|
|thiserror|[MIT License](https://github.com/dtolnay/thiserror/blob/master/LICENSE-MIT)|
|tokio|[MIT License](https://github.com/tokio-rs/tokio/blob/master/LICENSE)|
|uuid|[MIT License](https://github.com/uuid-rs/uuid/blob/master/LICENSE-MIT)|
|wasi|[Apache-2.0 License](https://github.com/bytecodealliance/wasi-rs/blob/main/LICENSE-Apache-2.0_WITH_LLVM-exception)|
|wasm-bindgen|[Apache-2.0 License](https://github.com/rustwasm/wasm-bindgen/blob/main/LICENSE-APACHE)|
