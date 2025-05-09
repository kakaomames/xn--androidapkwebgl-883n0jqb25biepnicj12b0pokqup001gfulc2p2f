const { exec } = require('child_process');
const path = require('path');
const { google } = require('googleapis');
const fs = require('fs');

// Unity のビルド部分
const UNITY_PATH = `"C:\\Program Files\\Unity\\Hub\\Editor\\6000.1.1f1\\Editor\\Unity.exe"`;
const PROJECT_PATH = `"C:\\Users\\kawam\\My project"`;
const command = `${UNITY_PATH} -batchmode -nographics -silent-crashes -quit -projectPath ${PROJECT_PATH} -executeMethod BuildScript.BuildWebGL`;

console.log("🚀 Unity ビルド開始...");

exec(command, (error, stdout, stderr) => {
  if (error) {
    console.error(`❌ エラー:\n${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`⚠️ 警告:\n${stderr}`);
    return;
  }
  console.log(`✅ 成功:\n${stdout}`);
  
  // ビルドが完了したら、次のステップへ
  uploadToGoogleDrive();
});

// Google Drive アップロード
async function uploadToGoogleDrive() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'serviceAccountKey.json',
    scopes: ['https://www.googleapis.com/auth/drive.file'],
  });

  const drive = google.drive({ version: 'v3', auth });
  const webglFolderPath = path.join(__dirname, 'Build/WebGL');

  try {
    const files = fs.readdirSync(webglFolderPath);
    for (const file of files) {
      const filePath = path.join(webglFolderPath, file);
      const fileMetadata = { name: file, parents: ['1UGy4AmMXERo2sGEizJr0V8JfgOKsgtGp'] };
      const media = { body: fs.createReadStream(filePath) };

      const res = await drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
      });

      console.log(`✅ ファイル "${file}" を Google Drive にアップロードしました！ ID: ${res.data.id}`);
      const googleDriveUrl = `https://drive.google.com/uc?id=${res.data.id}`;
      uploadToGitHub(googleDriveUrl);
    }
  } catch (error) {
    console.error('❌ アップロード失敗:', error);
  }
}

// GitHub アップロード
const fetch = require('node-fetch');
const githubUser = 'kakaomames';
const repo = 'apk';
const branch = 'main';
const fileName = 'webgl_link.txt';
const githubToken = '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';

async function uploadToGitHub(googleDriveUrl) {
  const base64Content = Buffer.from(googleDriveUrl).toString('base64');
  const url = `https://api.github.com/repos/${githubUser}/${repo}/contents/${fileName}`;

  const payload = {
    message: 'Update WebGL build link',
    content: base64Content,
    branch: branch,
  };

  const options = {
    method: 'PUT',
    headers: { Authorization: `token ${githubToken}` },
    body: JSON.stringify(payload),
  };

  try {
    const response = await fetch(url, options);
    const data = await response.json();
    if (data.content) {
      console.log(`✅ GitHubにリンクをアップロードしました: ${googleDriveUrl}`);
    }
  } catch (error) {
    console.error('❌ GitHubへのアップロード失敗:', error);
  }
}
