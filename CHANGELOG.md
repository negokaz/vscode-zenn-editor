# Change Log

vscode-zenn-editor の注目すべき変更はこのファイルで文書化されます。

このファイルの書き方に関する推奨事項については、[Keep a Changelog](http://keepachangelog.com/) を確認してください。

## [リリース予定]
[リリース予定]: https://github.com/negokaz/vscode-zenn-editor/compare/v0.5.0...HEAD

## [0.5.0] - 2021-04-19
[0.5.0]: https://github.com/negokaz/vscode-zenn-editor/compare/v0.4.0...v0.5.0

### Added

- article と book を VSCode 上で作成できるようになりました [PR#9](https://github.com/negokaz/vscode-zenn-editor/pull/9)

    `ZENN CONTENTS` ビューに表示されるアイコンをクリックするか、コマンドパレットで次のコマンドを実行します

    - Zenn Editor: Create New Article
    - Zenn Editor: Create New Book

## [0.4.0] - 2021-02-28
[0.4.0]: https://github.com/negokaz/vscode-zenn-editor/compare/v0.3.0...v0.4.0

### Added

- article と book の一覧を Explorer で確認できるようになりました [PR#7](https://github.com/negokaz/vscode-zenn-editor/pull/7)

    一覧はファイル名ではなくコンテンツのタイトルで表示されます。  
    また、公開/非公開の状態や本のセクションの有料/無料をアイコンで確認できます

    ![](docs/images/CHANGELOG/tree-view.png)


## [0.3.0] - 2021-02-28
[0.3.0]: https://github.com/negokaz/vscode-zenn-editor/compare/v0.2.0...v0.3.0

### Added

- ステータスバーに画像アップロードページへのリンクが表示されるようになりました [PR#5](https://github.com/negokaz/vscode-zenn-editor/pull/5)

    ![](docs/images/CHANGELOG/status-bar-upload-image.png)

    Zenn Editor のプレビューが開いている時にだけ表示されます

## [0.2.0] - 2021-02-27

[0.2.0]: https://github.com/negokaz/vscode-zenn-editor/compare/v0.1.0...v0.2.0

### Added

- `./node_modules/.bin` の zenn コマンドを環境変数 `PATH` の設定なしで認識する [PR#2](https://github.com/negokaz/vscode-zenn-editor/pull/2)

### Fixed

- リンクカードをクリックしてもページを開けない問題を修正 [PR#3](https://github.com/negokaz/vscode-zenn-editor/pull/3)

## [0.1.0] - 2021-02-23

[0.1.0]: https://github.com/negokaz/vscode-zenn-editor/compare/v0.0.0...v0.1.0

- 初回リリース🚀
