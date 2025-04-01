<h1 align="center">
  <a href="https://github.com/Byte-tea/yaa/">
    <img src="assets/yaa.svg" width="150" height="150" alt="banner" /><br>
  </a>
</h1>

<p align="center">中文 | <a href="README.en.md">English</a></p>

## yaa

`yaa` 的意思是 Yet Another Agent。是一个能分析理解自然语言指示，自动创建、规划、执行、验证任务的智能体。

## 快速上手

### 部署

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

### 使用

以服务模式启动：

```bash
python -m yaa.yaa --serve --config Config.json --server-config ServerConfig.json
```

以命令行交互模式启动：

```bash
python -m yaa.yaa --config Config.json
> 请用 Python 写一个冒泡排序算法。
* 好的……
```

单行命令交互：

```bash
python -m yaa.yaa --run '请用 Python 写一个冒泡排序算法。' --config Config.json
* 好的……
```

更多使用方法：

```bash
# 执行：python -m yaa.yaa --help
usage: yaa.py [-h] [--run [RUN] | --serve]
              [--config CONFIG]
              [--port PORT]

yaa 智能体命令行工具

options:
  -h, --help       显示帮助信息
  --run [RUN]      传入命令到智能体
  --serve          启动服务模式
  --config CONFIG  配置文件路径
  --port PORT      服务端口号，默认 12345
```

## 项目实现

详见 [yaa 文档](docs/README.md)。
