<h1 align="center">
  <a href="https://github.com/Byte-tea/yaa/">
    <img src="assets/yaa.svg" width="150" height="150" alt="banner" /><br>
  </a>
</h1>

<p align="center">中文 | <a href="README.en.md">English</a></p>

## yaa

`yaa` 的意思是 Yet Another Agent。是一个能分析理解自然语言指示，自动创建、规划、执行、验证任务的智能体。

## 快速上手

部署到本地：

```bash
git clone https://github.com/Byte-tea/yaa.git
cd yaa
```

使用方法：

```bash
# python -m yaa.yaa --help
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
