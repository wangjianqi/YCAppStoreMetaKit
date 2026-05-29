#!/bin/bash

# YCAppStoreMetaKit 重新安装脚本
# 用于在修改代码后重新安装到本地并全局有效

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo "🔄 重新安装 YCAppStoreMetaKit..."
echo ""

# 1. 取消全局链接（如果已存在）
echo "📦 步骤 1/5: 取消旧的全局链接..."
npm unlink -g yc-appstore-metakit 2>/dev/null || true

# 2. 删除 node_modules 和 package-lock.json（可选，用于完全干净安装）
echo "📦 步骤 2/5: 清理依赖..."
rm -rf node_modules
rm -f package-lock.json

# 3. 重新安装依赖
echo "📦 步骤 3/5: 安装依赖..."
npm install

# 4. 建立新的全局链接
echo "📦 步骤 4/5: 建立全局链接..."
npm link

# 5. 验证安装
echo "📦 步骤 5/5: 验证安装..."
echo ""
if command -v ycmeta &> /dev/null; then
    echo "✅ 安装成功！"
    echo ""
    echo "📍 ycmeta 位置:"
    which ycmeta
    echo ""
    echo "📋 ycmeta 版本信息:"
    ycmeta --help | head -10
else
    echo "❌ 安装失败，ycmeta 命令不可用"
    exit 1
fi

echo ""
echo "🎉 重新安装完成！"
echo ""
echo "💡 使用提示:"
echo "   ycmeta --help     查看帮助"
echo "   ycmeta init       初始化项目"
echo "   ycmeta check      校验元数据"
echo "   ycmeta preview    预览工作流"
