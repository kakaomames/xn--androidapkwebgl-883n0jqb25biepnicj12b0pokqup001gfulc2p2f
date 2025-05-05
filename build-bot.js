const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'pokemogu-9fbb0.appspot.com'
});

const bucket = admin.storage().bucket();

async function run() {
  console.log('APKチェック中...');

  const [files] = await bucket.getFiles({ prefix: 'apk-uploads/' });

  if (files.length === 0) {
    console.log('新しいAPKは見つかりませんでした');
    return;
  }

  const target = files[files.length - 1];
  const localApkPath = path.join(__dirname, 'latest.apk');

  await target.download({ destination: localApkPath });
  console.log(`APKダウンロード完了: ${target.name}`);

  try {
    execSync(`"C:/Program Files/Unity/Hub/Editor/2022.3.0f1/Editor/Unity.exe" -batchmode -nographics -quit -projectPath "${__dirname}/unity" -executeMethod BuildScript.BuildWebGL`);
    console.log('Unityビルド成功！');
  } catch (err) {
    console.error('Unityビルド失敗:', err.message);
    return;
  }

  try {
    execSync('firebase deploy --only hosting');
    console.log('Firebase Hosting にアップロード完了！');
  } catch (err) {
    console.error('Firebase アップロード失敗:', err.message);
  }

  fs.unlinkSync(localApkPath);
  console.log('完了！');
}

run().catch(console.error);
