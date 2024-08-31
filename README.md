# ①課題番号-プロダクト名

見ながらチャット(ニコ動風)

## ②課題内容（どんな作品か）

YouTubeを見ながらニコ動風にチャットできる

## ③DEMO

https://onyanyada.github.io/kadai04_chat/

## ④作ったアプリケーション用のIDまたはPasswordがある場合

- ID:なし
- PW:なし

## ⑤工夫した点・こだわった点

- YouTubeリンクを入力すると、その画面上でニコニコ動画のようにコメントを見られる
- Google認証
- 認証されたユーザーしかコメントできない、コメントごとにユーザーを判別できる
- メールリンク認証（デプロイが必要）
- FireStorageを使用した画像保存

## ⑥難しかった点・次回トライしたいこと(又は機能)

- LINE等の認証方法
  
## ⑦質問・疑問・感想、シェアしたいこと等なんでも

- 質問1.jsのファイル分け方法、特に今回のfirebaseのような場合、config、main、機能別にファイルを分けるのだと思いますが、同じ関数などを違うファイルで呼び出してるとき複雑です
- 質問2.ローカル変数を別の関数に渡す方法…引数、returnとか理解不足な気がします
- 質問3.今回firebaseの関数で出てきたコールバック関数について解説

  
↓シェア：ほそかわさんに今回の課題等について色々役立つ情報を教えていただきました！
- like機能の実装：https://ada2ndgsacademy.slack.com/archives/C079ACT8WG0/p1724850669417609?thread_ts=1724822418.542539&cid=C079ACT8WG0
- ローカル変数を他に渡す方法：https://ada2ndgsacademy.slack.com/archives/C079ACT8WG0/p1724921808469139?thread_ts=1724913541.681759&cid=C079ACT8WG0
- 変数のスコープ、onChildAdded：https://ada2ndgsacademy.slack.com/archives/C079ACT8WG0/p1725099149350959?thread_ts=1725087106.287999&cid=C079ACT8WG0
- 親要素のmax-widthとmin-widthはinline-blockもblockに影響を与える：https://ada2ndgsacademy.slack.com/archives/C079ACT8WG0/p1724754408942279?thread_ts=1724750427.337229&cid=C079ACT8WG0

