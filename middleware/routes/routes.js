const fs = require('fs');
const { initializeNewThreadDb, getThreadID, getAPISignature } = require('../lib/hub-helpers');

module.exports = (app) => {
  
  /**
   * ThreadDBを初期化するためのAPI
   */
  app.get('/initializeNewThreadDB', async (req, res) => {
    // initializeNewThreadDbメソッドを呼び出す。
    const thread = await initializeNewThreadDb();
    const threadID = Array.from(thread);
    // ファイルに書き込む
    fs.writeFileSync(
      'threadID.json',
      JSON.stringify({
        threadID,
      }),
      (e) => {
        if (e) {
          console.log(e);
        }
        console.log('ThreadID stored in the file!');
      }
    );
    console.log('New threadDB created!');
    // レスポンスを返す。
    res.send({ message: 'New threadDB created!' });
  });

  /**
   * ThreadIDを取得するメソッド
   */
  app.get('/getThreadID', async (req, res) => {
    // getThreadIDメソッドを呼び出す。
    const threadID = await getThreadID();
    // レスポンスを返す。
    res.send({ threadID });
  });
};
