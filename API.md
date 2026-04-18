# Shrimp Eye API (Simple)

这份文档描述本项目后端坐标接口与前端调试字段，方便你和其他前端联调。

## Base URL

- 默认：`http://127.0.0.1:3000`
- 坐标接口：`GET /coordinate`
- 健康检查：`GET /health`

---

## 1) 健康检查

### Request

`GET /health`

### Response

```json
{"ok": true}
```

---

## 2) 坐标接口

### Request

`GET /coordinate`

可选 query:

- `format=object|nested|array|text`

### 默认响应（object）

```json
{"x": 320, "y": 240}
```

### 兼容响应格式

1. `object`

```json
{"x": 320, "y": 240}
```

2. `nested`

```json
{"coordinate": {"x": 320, "y": 240}}
```

3. `array`

```json
[320, 240]
```

4. `text`

```text
320,240
```

> 说明：当前后端输出的是像素坐标（基于 `EYE_COORD_WIDTH` / `EYE_COORD_HEIGHT` 映射）。

---

## 3) 调试面板字段（前端插件）

页面右下角 debug panel 中主要字段：

- `source`
  - `api`: 来自坐标接口
  - `calibration`: 校准流程采样中
  - `request-error`: 请求失败回退中
  - `config`: 配置缺失（如 URL 未设置）
- `basis`
  - 当前坐标基准解释模式：`auto|viewport|document`
- `pollMs`
  - 前端轮询间隔（毫秒）
- `latencyMs`
  - 本次接口请求耗时（毫秒）
- `fallback`
  - `none|mouse|center|center-no-url`
- `raw API`
  - 接口原始坐标（未换算）
- `viewport`
  - 按 `basis` 换算到当前视口后的坐标
- `mapped`
  - 经过校准映射后的最终坐标（高亮实际使用）
- `calibration`
  - `on|off`（是否启用校准参数）

---

## 4) 常用环境变量（后端）

- `EYE_SERVER_HOST`：服务地址，默认 `127.0.0.1`
- `EYE_SERVER_PORT`：服务端口，默认 `3000`
- `EYE_SERVER_ENDPOINT`：坐标路径，默认 `/coordinate`
- `EYE_COORD_FORMAT`：默认返回格式，默认 `object`
- `EYE_COORD_WIDTH`：坐标映射宽度，默认 `1920`
- `EYE_COORD_HEIGHT`：坐标映射高度，默认 `1080`
- `EYE_FLIP_X`：X 轴翻转，默认开启（`1`）

示例（Windows PowerShell）：

```powershell
set EYE_SERVER_PORT=3001
set EYE_COORD_FORMAT=nested
set EYE_FLIP_X=1
python python-eye-server/eye_server.py
```

---

## 5) 快速联调示例

```powershell
# 健康检查
curl http://127.0.0.1:3000/health

# 默认格式
curl http://127.0.0.1:3000/coordinate

# 嵌套格式
curl "http://127.0.0.1:3000/coordinate?format=nested"
```
