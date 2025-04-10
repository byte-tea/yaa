<h1 align="center">
  <a href="https://github.com/Byte-tea/yaa/">
    <img src="assets/yaa.svg" width="150" height="150" alt="banner" /><br>
  </a>
</h1>

<p align="center"><a href="README.md">简体中文</a> | English</p>

## yaa

`yaa` means Yet Another Agent, which can analyze and understand natural language instructions and automatically create, plan, execute, and check tasks.

## Quick Start

### Client

[View](client/index.html)

### Server

#### Deployment

Deploy locally:

```bash
# Clone project repository to local
git clone https://github.com/Byte-tea/yaa.git
# Enter project directory
cd yaa
```

Configuration:

```bash
# Create client config file (will override default config)
cp configs/Config.example.json Config.json
# Create server config file (will override default config)
cp configs/ServerConfig.example.json ServerConfig.json
```

#### Usage

Start in server mode:

```bash
cargo run --release -- --serve --port 12345
```

Start in interactive CLI mode:

```bash
cargo run --release
> Please write a bubble sort algorithm in Python.
* Working on it...
```

## Contribute

See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

## Project Implementation

See [yaa documentation](docs/README.md) for details.

## License

[MIT License](LICENSE)

## Additional Licenses

### Client Dependencies

|Name|License|
|:-:|:--|
|tabler-icons|[MIT License](//mit-license.org)|
|markedjs/marked|[marked License](https://github.com/markedjs/marked/blob/master/LICENSE.md)|
|mermaidjs/mermaid|[MIT License](https://github.com/mermaid-js/mermaid/blob/develop/LICENSE)|

### Server Dependencies

|Name|License|
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
