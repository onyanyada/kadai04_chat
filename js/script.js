// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getDatabase, ref, push, set, update, remove, onChildAdded, onChildChanged, onChildRemoved, get }
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, sendSignInLinkToEmail, isSignInWithEmailLink, signInWithEmailLink }
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getStorage, ref as storageRef, uploadBytes, getDownloadURL, deleteObject }
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

// TODO: Add SDKs for Firebase products that you want to use


// Your web app's Firebase configuration
const firebaseConfig = {

};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app); //RealtimeDBに接続
const dbRef = ref(db, "chat"); //RealtimeDB内の"chat"を使う
const storage = getStorage(app);
// GoogleAuth(認証用)
const provider = new GoogleAuthProvider();
//provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
const auth = getAuth();


let userId = null; // グローバル変数として定義
let uuid = null;// グローバル変数として定義

// コメント送信
$("#send").on("click", function () {
    if (userId) {
        fileSend();
    } else {
        alert("ログインが必要です");
    }
});


// データ登録
function sendData(userId, url, uuid) {
    const msg = {
        uname: $("#uname").val(),
        text: $("#text").val(),
        time: new Date().toLocaleString(), // 現在時刻を取得
        like: 0,//初期値
        userId: userId,
        url: url ? url : null, // URLがある場合は設定、ない場合はnull
        uuid: uuid // 生成されたUUIDを保存
    }
    const newPostRef = push(dbRef);//ユニークキー生成（Post出来る状況を作る）
    set(newPostRef, msg); //DBに値をセットする

    $('#uname').val('');
    $('#text').val('');
    $('#results').html('');
}

//データ取得
onChildAdded(dbRef, function (data) {
    const msg = data.val();// データベースから取得したメッセージデータを取得
    const key = data.key;//各メッセージのユニークキー　削除・更新に必須
    const like = msg.like;  // 現在のlike数をDBから取得
    let h = '<p id="' + key + '" class="memo">';
    h += '<span class="postname">' + msg.uname + '</span>';
    h += '<span class="outputtxt" contentEditable="true" id="' + key + '_update">' + msg.text + '</span>';

    h += '<br>';
    h += '<span class="posttime">' + msg.time + '</span>';
    h += '<span class="remove" data-key="' + key + '"><i class="fa-solid fa-trash"></i></span>';
    h += '<span class="update" data-key="' + key + '"><i class="fa-solid fa-check"></i></span>';
    h += '<span class="like" data-key="' + key + '"><i class="fa-solid fa-thumbs-up"></i></span><span class="likeNum">' + like + '</span>';
    h += '</br>';
    if (msg.url) {
        // h += '<img id="imgResult" src="' + msg.url + '">';
        h += '<img id="#' + uuid + '" src="' + msg.url + '">';

    }
    h += '</p>';
    $(".outComment").prepend(h);//先頭に追加
    $('.uodown-output').prepend(h);


    //youtube上はコメントのみにする
    $(".outComment .postname").remove();
    $(".outComment .posttime").remove();
    $(".outComment .remove").remove();
    $(".outComment .update").remove();
    $(".outComment .like").remove();
    $(".outComment .likeNum").remove();

    // .outComment pにランダムな装飾をつける
    let theKeyItem = `.outComment #${key}`;

    const r = Math.ceil(Math.random() * 3);//1.乱数(1~3)
    if (r == 1) {
        $(theKeyItem).addClass('font1');
    } if (r == 2) {
        $(theKeyItem).addClass('font2');
    } if (r == 3) {
        $(theKeyItem).addClass('font3');
    }


    // アニメーション終了時
    $(theKeyItem).on('animationend', function () {
        $(theKeyItem).css('display', 'none');
    });


});


//削除
//output領域内の.removeクラスを持つ要素がクリックされたとき
$("#output, .uodown-output").on("click", ".remove", function () {
    // 削除するメッセージのユニークキーを取得
    const key = $(this).attr("data-key");
    // 削除対象のデータベースの参照を取得
    const remove_item = ref(db, "chat/" + key);
    // Firebaseデータベースからメッセージを削除：Fireデータベース削除関数
    remove(remove_item);
    // imgDeleteFromStorage(storageReference);
});

// 削除
//Firebaseデータベースからメッセージが削除されたときに、
onChildRemoved(dbRef, (data) => {
    //そのメッセージを画面上からも削除
    $("#" + data.key).remove();
});


//更新ボタンを押さないとDBに反映されない
//output領域内の.updateクラスを持つ要素がクリックされたとき
$("#output, .uodown-output").on("click", ".update", function () {
    // 更新するメッセージのユニークキーを取得
    const key = $(this).attr("data-key");
    update(ref(db, "chat/" + key), {
        // 更新するテキストを取得し、データベースに保存
        text: $("#" + key + '_update').html()
    });
});


// 更新
onChildChanged(dbRef, (data) => {
    //画面上の対応するメッセージも更新
    $("#" + data.key + '_update').html(data.val().text);
    // 更新がわかるようにフェードアニメーション
    $("#" + data.key + '_update').fadeOut(800).fadeIn(800);
});

//LIKE
//output領域内の.likeクラスを持つ要素がクリックされたとき
$("#output, .uodown-output").on("click", ".like", function () {
    let gottenLike = $(this).next(".likeNum").text();
    let likeNum = Number(gottenLike);
    //LIKE数を増やす
    likeNum += 1;
    //LIKE数を表示に反映
    $(this).next(".likeNum").text(likeNum);
    // 更新するLIKEのユニークキーを取得
    const key = $(this).attr("data-key");
    update(ref(db, "chat/" + key), {
        // 更新するLIKE数をデータベースに保存
        like: likeNum
    });
});


// youtube埋め込み
$("#embed-video").click(function () {
    let theVideoLink = $('#youtube-link').val();
    let theEmbedLink = theVideoLink.slice(17);
    $("#output").html(`<iframe src="https://www.youtube.com/embed/${theEmbedLink}" 
        title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; 
        clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
        referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe><div class="outComment">
      </div>`);
});



// Login処理
$("#login").on("click", function () {
    //Google認証完了後の処理
    //firebaseが用意してる関数
    signInWithPopup(auth, provider).then((result) => {
        //Login後のページ遷移
        location.href = "index.html";//遷移先
    }).catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        const email = error.email;
        const credential = GoogleAuthProvider.credentialFormError(error);
        console.log(errorCode);
        console.log(errorMessage);
        console.log(email);
        console.log(credential);
        alert("サインイン中にエラーが発生しました。");
    });

});



//Loginしていれば処理
onAuthStateChanged(auth, (user) => {
    if (user) {
        userId = user.uid; // グローバル変数に保存
        if (user !== null) {
            user.providerData.forEach((profile) => {
                $("#gname").text(profile.displayName);
                $("#prof").attr("src", profile.photoURL);
                console.log(profile.providerId);
                console.log(profile.uid);
                console.log(profile.email);
                console.log(profile.photoURL);
                console.log(userId);
            });

            $("#status").fadeOut(500);

        }
    } else {
        $("#gname").text("ゲスト");
        $("#prof").attr("src", "../img/guest.jpeg");
        $(".loader").css("display", "none");
        $("#out").text("ログイン");
        //Loginしてなかったら書き込めない
        $("#uname, #text").click(function () {
            _redirect();
            alert("ログインしないと書き込めません");
        });
    }
});

// Login画面へリダイレクト
function _redirect() {
    location.href = "login.html";
}

//Logout
$("#out").click(function () {
    signOut(auth).then(() => {
        // ログアウト成功
        _redirect();
    }).catch((error) => {
        console.error(error);
    });
});


//File取得
function fileSend() {
    const file = $("#file")[0].files[0];

    // ファイルがない場合
    if (!file) {
        sendData(userId, null, null); // URLがないのでnullを渡す
        return; // 以下の処理の必要がないため次のコードの実行を防ぐ
    }

    //画像のユニークキー生成
    uuid = self.crypto.randomUUID();
    console.log(uuid);
    $("#imgResult").attr('id', uuid);

    // 送信されたファイルの保存パス
    const url = `image/${file.name}_${uuid}`;
    //画像をどこに保存するか
    const storageReference = storageRef(storage, url);

    //Storageにアップロード
    uploadBytes(storageReference, file)
        //snapshotはアップロード後、その結果情報を含んだオブジェクト
        //このsnapshotで、アップロード成功を確認
        .then((snapshot) => {
            console.log('Upload Success');
            // ファイルのURLをstorageから取得
            getDownloadURL(storageRef(storage, url))
                //非同期処理が正常終了した際
                // `url` = 'images/file.name_uuid'
                .then((url) => {
                    $(`#${uuid}`).attr('src', url);
                    $('#file').val('');

                    // 取得したダウンロードURLをRealtime Databaseに保存
                    sendData(userId, url, uuid);

                })
                //非同期処理が異常終了した際
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    console.error('Error:', errorCode);
                    console.log('ErrorMessage:', errorMessage);//ErrorMessage: url is not definedエラー
                });
        });
}


// アップロードした画像をstorageからも削除
// function imgDeleteFromStorage(storageReference) {
//     // Delete the file
//     deleteObject(storageReference).then(() => {
//         console.log("File deleted successfully");
//     }).catch((error) => {
//         const errorCode = error.code;
//         const errorMessage = error.message;
//         console.error('Error:', errorCode);
//         console.log('ErrorMessage:', errorMessage);
//     });
// }




$("#mailLogin").click(function () {

    //ユーザーのメールアドレスに認証リンクを送信する
    //1.メールリンクの作成方法を Firebase に伝える
    const actionCodeSettings = {
        url: '',
        handleCodeInApp: true,
    };
    let email = $("#mailAddress").val();
    console.log(email);//OK
    //2.ユーザーにメールアドレスを求める
    //3.ユーザーのメールアドレスに認証リンクを送信し、
    sendSignInLinkToEmail(auth, email, actionCodeSettings)
        .then(() => {
            //ユーザーが同じデバイスでメールによるログインを完了する場合に備えこのメールアドレスを保存。
            window.localStorage.setItem('emailForSignIn', email);
            // ...
        })
        .catch((error) => {
            const errorCode = error.code;
            const errorMessage = error.message;
            console.error('Error:', errorCode);
            console.log('ErrorMessage:', errorMessage);
        });

    //4.ウェブページでログインを完了
    //URLにメールリンクサインインのコードが含まれているかどうかを判断
    if (isSignInWithEmailLink(auth, window.location.href)) {
        let email = window.localStorage.getItem('emailForSignIn');
        if (!email) {
            //localstorageにメアドが見つからなかった場合（例:別のデバイスでリンクを開いた場合）、
            //ユーザーにメールアドレスを再入力させる
            email = window.prompt('Please provide your email for confirmation');
        }
        // メールリンクでサインイン。メアドとリンク内の認証コードを使用してサインイン完了
        signInWithEmailLink(auth, email, window.location.href)
            //サインインが成功した場合
            .then((result) => {
                // Clear email from storage.
                window.localStorage.removeItem('emailForSignIn');
            })
            .catch((error) => {
                // Common errors could be invalid email and invalid or expired OTPs.
                const errorCode = error.code;
                const errorMessage = error.message;
                console.error('Error:', errorCode);
                console.log('ErrorMessage:', errorMessage);
            });
    }
});

