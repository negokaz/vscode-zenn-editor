# VS Code Zenn Editor

[![](https://img.shields.io/visual-studio-marketplace/v/negokaz.zenn-editor.svg)](https://marketplace.visualstudio.com/items?itemName=negokaz.zenn-editor) [![](https://img.shields.io/visual-studio-marketplace/i/negokaz.zenn-editor)](https://marketplace.visualstudio.com/items?itemName=negokaz.zenn-editor)

[Zenn CLI](https://zenn.dev/zenn/articles/install-zenn-cli) を VS Code に統合する非公式の拡張です。

## Features

- 投稿コンテンツを作成できます
- 投稿コンテンツの一覧を VS Code 上で確認できます
- 編集中の `articles` か `books` を VS Code 上でプレビューできます

## Requirements

- Zenn CLI がインストールされている必要があります。インストール方法は [こちら](https://zenn.dev/zenn/articles/install-zenn-cli)

## Demo

![demo](docs/images/demo.gif)

## Known Issues

- 記事に埋め込まれた YouTube の動画は VS Code の制約によりプレビュー上で再生できません：
    - [Can not play video in webview · Issue · microsoft/vscode](https://github.com/microsoft/vscode/issues/54097)

## Usages

### article の作成

Zenn Contents ビュー上の紙のアイコンをクリックするか、コマンドパレットから `Zenn Editor: Create New Article` を実行します。

![](docs/images/tree-view-commands.png)

### book の作成

Zenn Contents ビュー上の本のアイコンをクリックするか、コマンドパレットから `Zenn Editor: Create New Book` を実行します。

![](docs/images/tree-view-commands.png)

### 投稿コンテンツのプレビュー

投稿コンテンツの編集中に、次のプレビューボタンをクリックします。

![](docs/images/preview-button.png)

### 複数のリポジトリをひとつのウィンドウで編集する

Zenn には 2 つまで連携するリポジトリを設定できます。

複数のリポジトリをひとつのウィンドウで編集するには、VSCode のワークスペースを構成します。

`Add Folder to Workspace` でもうひとつのローカルリポジトリを指定し、`Save Workspace As` でワークスペースを保存します。保存されたワークスペースを開くと複数のリポジトリの同時編集をいつでも再開できます。

![](docs/images/create-workspace.png)

## Changelog

[CHANGELOG.md](CHANGELOG.md) を参照してください。

## License

Copyright (c) 2021 Kazuki Negoro

vscode-zenn-editor is released under the [MIT License](LICENSE)
