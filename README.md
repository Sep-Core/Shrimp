# Shrimp + Eye Server

本仓库当前包含：

- `shrimp/`：正式版 Chrome 插件（主项目）
- `python-eye-server/`：本地眼动后端（HTTP API + WebUI + 校准）
- `archive/eye-extension-legacy/`：旧调试插件归档（已停用）

## 快速开始

1) 启动后端：

```powershell
cd python-eye-server
pip install -r requirements.txt
python eye_server.py
```

2) 加载正式插件：

- 打开 `chrome://extensions`
- 开启开发者模式
- 加载 `shrimp/` 目录
- 在弹窗填写 `http://127.0.0.1:3000/coordinate`

默认服务地址：

- 坐标：`http://127.0.0.1:3000/coordinate`
- 健康检查：`http://127.0.0.1:3000/health`
- WebUI：`http://127.0.0.1:3000/`

## Shrimp 插件特性

- 页面聚焦遮罩：焦点外轻微降亮/降对比/降饱和
- 三种自动模式：
  - Focused Reading（默认）
  - Scanning Mode（快速移动触发）
  - Fatigue State（长时低活动触发）
- 弹窗中可调参数：半径、偏移、过渡、视觉倍率、模式阈值
- 校准入口（已集成）：
  - `开始校准`：在当前页显示蓝点采样并提交到后端 `/calibration`
  - `重置校准`：调用后端 `/calibration/reset`
  - `打开后端校准页`：跳转后端 WebUI

## 后端预览与关键点叠加

```powershell
python eye_server.py --preview
```

指定摄像头：

```powershell
python eye_server.py --preview --camera-index 1
```

按 `Q` 或 `Esc` 退出预览。

## 校准与持久化

- WebUI 或 Shrimp 插件都可触发后端校准
- 校准模型由后端计算并应用到 `/coordinate` mapped 输出
- 校准参数自动保存到 `python-eye-server/calibration.json`
- 重启服务后自动加载（可用 `EYE_CALIBRATION_FILE` 覆盖路径）

## 坐标与调试格式

`/coordinate` 兼容返回：

- `{"x":320,"y":240}`
- `{"coordinate":{"x":320,"y":240}}`
- `[320,240]`
- `320,240`

可选：

- `?format=object|nested|array|text|debug`
- `?debug=1` / `?verbose=1`

完整 API 与调试字段见 `API.md`。
