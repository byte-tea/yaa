<h1 align="center">
  <a href="https://github.com/Byte-tea/yaa/">
    <img src="assets/yaa.svg" width="150" height="150" alt="banner" /><br>
  </a>
</h1>

<p align="center"><a href="README.md">简体中文</a> | English</p>

## yaa

`yaa` means Yet Another Agent, which can analyze and understand natural language instructions and automatically create, plan, execute, and check tasks.

## Quick Start

Deploy locally:

```bash
git clone https://github.com/Byte-tea/yaa.git
cd yaa
```

Usage:

```bash
# python -m yaa.yaa --help
usage: yaa.py [-h] [--run [RUN] | --serve]
              [--config CONFIG]
              [--port PORT]

yaa agent command line interface

options:
  -h, --help       show this help message
                   and exit
  --run [RUN]      send command to agent
  --serve          server mode
  --config CONFIG  config file
  --port PORT      server port default 12345
```

## Project Implementation

See [yaa documentation](docs/README.md) for details.
