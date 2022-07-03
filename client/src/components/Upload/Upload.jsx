import {
  Button,
  Card,
  Fieldset,
  Note,
  Text,
  useToasts
} from '@geist-ui/core';
import { Trash } from '@geist-ui/icons';
import axios from 'axios';
import FormData from 'form-data';
import { useEffect, useRef, useState } from 'react';
import {
  decryptPostsWithLit,
  encryptedPostsBase64ToBlob,
  encryptedPostsBlobToBase64,
  encryptPostsWithLit
} from '../../lib/lit';
import './style.css';

// 設定ファイルから読み込む
const {
  REACT_APP_API_Key,
  REACT_APP_API_Secret
} = process.env;

/**
 * Uploadコンポーネント
 * @param {*} param0 各種引数
 */
export const Upload = ({ wallet, ceramic, writer, authSig, handleRerender, handleMessage }) => {
  // ステート変数
  const { setToast } = useToasts({ placement: 'bottomRight', padding: '1rem' });
  const [userHasDeployed, setUserHasDeployed] = useState(false);
  const [userAccessControlConditions, setUserAccessControlConditions] = useState();
  const [userEncryptedSymmetricKey, setUserEncryptedSymmetricKey] = useState();
  const [userEncryptedPosts, setUserEncryptedPosts] = useState();
  const [userDecryptedPosts, setUserDecryptedPosts] = useState([]);
  const [userHasSetAccessControlConditions, setUserHasSetAccessControlConditions] = useState(false);
  const [editorIsOpen, setEditorIsOpen] = useState(false);
  const [selectedPostToEditID, setSelectedPostToEditID] = useState();
  const [publishBtnLoading, setPublishBtnLoading] = useState(false);
  const [ fileName, setFileName ] = useState('select a file')
  const [ file, setFile] = useState({})

  const editorJS = useRef();

  const closeEditor = () => {
    setEditorIsOpen(false);
  };


  const publishPost = async (postType) => {
    try {
      let finalDraft;

      if (postType === 'new') {
        const draft = window.localStorage.getItem(`editorDraft-new-${wallet.address}`);
        if (draft !== null) {
          finalDraft = JSON.parse(draft);
        }
      } else if (postType === 'edit') {
        const draft = window.localStorage.getItem(`editorDraft-${selectedPostToEditID}-${wallet.address}`);
        if (draft !== null) {
          finalDraft = JSON.parse(draft);
        }
      }

      if (finalDraft.blocks.length === 0) {
        handleMessage('warning', 'Cannot publish empty files.');
      } else {
        setPublishBtnLoading(true);

        let newPosts = [...userDecryptedPosts];

        if (postType === 'new') {
          const newPost = {
            id: newPosts.length + 1,
            data: finalDraft,
          };

          newPosts.push(newPost);
        } else if (postType === 'edit') {
          const editedPost = {
            id: Number(selectedPostToEditID),
            data: finalDraft,
          };

          const postToEdit = newPosts.filter((post) => post.id === Number(selectedPostToEditID));
          const postToEditIndex = newPosts.indexOf(postToEdit[0]);

          newPosts[postToEditIndex] = editedPost;
        }

        const { encryptedPosts, encryptedSymmetricKey } = await encryptPostsWithLit(
          // ここをファイルに変える？？
          JSON.stringify(newPosts),
          userAccessControlConditions,
          authSig
        );

        const encryptedPostsBase64 = await encryptedPostsBlobToBase64(encryptedPosts);

        await ceramic.store.merge('writerData', {
          encryptedPosts: [encryptedPostsBase64],
        });

        await ceramic.store.merge('writerData', {
          encryptedSymmetricKey: [encryptedSymmetricKey],
        });

        setPublishBtnLoading(false);

        if (postType === 'new') {
          handleMessage('success', 'New post successfully published!');
        } else if (postType === 'edit') {
          handleMessage('success', 'Post successfully edited!');
        }

        setSelectedPostToEditID(0);

        handleRerender(true);
      }
    } catch (e) {
      console.log(e);

      setPublishBtnLoading(false);
      handleMessage('error', e.message);
    }
  };

  const deletePost = async (postToDelete) => {
    try {
      handleMessage('success', 'Deleting post...');

      let draft = window.localStorage.getItem(`editorDraft-${selectedPostToEditID}-${wallet.address}`);

      if (draft !== null) {
        window.localStorage.removeItem(`editorDraft-${selectedPostToEditID}-${wallet.address}`);
      }

      let newPosts = [...userDecryptedPosts];

      newPosts = newPosts.filter((post) => post.id !== postToDelete.id);

      const { encryptedPosts, encryptedSymmetricKey } = await encryptPostsWithLit(
        JSON.stringify(newPosts),
        userAccessControlConditions,
        authSig
      );

      const encryptedPostsBase64 = await encryptedPostsBlobToBase64(encryptedPosts);

      await ceramic.store.merge('writerData', {
        encryptedPosts: [encryptedPostsBase64],
      });

      await ceramic.store.merge('writerData', {
        encryptedSymmetricKey: [encryptedSymmetricKey],
      });

      handleMessage('success', 'Post successfully deleted!');

      setSelectedPostToEditID(0);

      handleRerender(true);
    } catch (e) {
      console.log(e);

      handleMessage('error', e.message);
    }
  };

  /**
   * ファイル名とファイル本体を保存するための関数
   */
  const saveFile = (e) => {
    setFile(e.target.files[0]);
    setFileName(e.target.files[0].name);
  };

  /**
     * Pinataへアップロードする際に実行する関数
     */
   const pintaUploadFile = async (event) => {
    // リクエストパラメータに詰める名前とデータ本体
    const { name, files } = event.target;
    event.target.value = '';

    // APIエンドポイントのベースURL
    const baseAPIUrl = "https://api.pinata.cloud";

    //送信用のデータを用意する。
    let postData = new FormData();
    // リクエストパラメータを作成する。
    postData.append('file', file);
    postData.append('pinataOptions', '{"cidVersion": 1}');
    postData.append('pinataMetadata', `{"name": "${fileName}", "keyvalues": {"company": "Pinata"}}`);
    
    try {
        // POSTメソッドで送信
        const res = await axios.post(
            // リクエスト先のURL
            baseAPIUrl + '/pinning/pinFileToIPFS', 
            // リクエストパラメータ
            postData , 
            // ヘッダー
            {
                headers: {
                    'accept': 'application/json',
                    'pinata_api_key': `${REACT_APP_API_Key}`,
                    'pinata_secret_api_key': `${REACT_APP_API_Secret}`,
                    'Content-Type': `multipart/form-data; boundary=${postData}`,
                },  
            });
        console.log(res);
        alert("ファイルアップロード成功！");
    } catch (e) {
        console.error("ファイルアップロード失敗：", e);
        alert("ファイルアップロード失敗");
    }
  };

  // 副作用フック
  useEffect(() => {
    /**
     * 初期化関数
     */
    async function init() {
      try {
        if (writer !== undefined) {
          // getHasWriterDeployedメソッドを呼び出す。
          const userHasDeployed = await writer.getHasWriterDeployed(wallet.address);
          // デプロイ済みだった場合
          if (userHasDeployed) {
            setUserHasDeployed(true);
            // DIDをもとに引っ張ってくる。
            const writerData = await ceramic.store.get('writerData', ceramic.did);

            if (writerData !== undefined && writerData !== null) {
              if (writerData.accessControlConditions) {
                const accessControlConditions = writerData.accessControlConditions[0];
                const minTokenCount = accessControlConditions[0].returnValueTest.value;

                if (Number(minTokenCount) > 0) {
                  setUserAccessControlConditions(accessControlConditions);
                  setUserHasSetAccessControlConditions(true);
                }
              }

              if (writerData.encryptedSymmetricKey) {
                const encryptedSymmetricKey = writerData.encryptedSymmetricKey[0];
                setUserEncryptedSymmetricKey(encryptedSymmetricKey);
              }

              if (writerData.encryptedPosts) {
                const encryptedPosts = writerData.encryptedPosts[0];
                setUserEncryptedPosts(encryptedPosts);
              }

              if (writerData.accessControlConditions && writerData.encryptedSymmetricKey && writerData.encryptedPosts) {
                if (
                  writerData.encryptedPosts[0] &&
                  writerData.encryptedSymmetricKey[0] &&
                  writerData.accessControlConditions[0]
                ) {
                  const encryptedPostsBlob = encryptedPostsBase64ToBlob(writerData.encryptedPosts[0]);
                  const userDecryptedPosts = await decryptPostsWithLit(
                    encryptedPostsBlob,
                    writerData.encryptedSymmetricKey[0],
                    writerData.accessControlConditions[0],
                    authSig
                  );
                  setUserDecryptedPosts(JSON.parse(userDecryptedPosts.decryptedPosts));
                }
              }
            }
          }
        }
      } catch (e) {
        console.log(e);

        handleMessage('error', e.message);
      }
    }
    // init()メソッドを呼び出す。
    init();

    return () => {
      if (editorJS.current) {
        editorJS.current.destroy();
        editorJS.current = null;
      }
    };
  }, []);

  return (
    <div className='writer-content'>
        <>
          <Fieldset.Group value='New'>
            {/* ファイルをアップロードするセクション */}
            <Fieldset label='New'>
              <div className="App">
              <label id="fileUpload" htmlFor="{input:inputFileBtnHide}">
                  <Button variant="outlined" type='secondary' shadow auto marginRight='2.8'>
                      {fileName}
                      <input type="file" onChange={saveFile}/>
                  </Button>
              </label>
              <br/><br/>
              <Button type='secondary' shadow auto marginRight='2.8' onClick={(e) => pintaUploadFile(e)}>
                Upload
              </Button>   
              </div>     
            </Fieldset>

            <Fieldset label='My Files' paddingBottom='1'>
              {userDecryptedPosts.length === 0 ? (
                <>
                  <Note width='fit-content' label='Note '>
                    You have not published any files yet. To publish your first file, head over to <b>New</b> section.
                  </Note>
                </>
              ) : userDecryptedPosts.length > 0 && !editorIsOpen ? (
                <div className='all-posts'>
                  {userDecryptedPosts.map((post) => {
                    return (
                      /* アップロードしたファイル一覧が並ぶ予定 */
                      <Card key={post.id} shadow width='95%'>
                        <Card.Content>ファイル名</Card.Content>
                        <Card.Footer>
                          <div className='card-footer'>
                            <div className='footer-text'>
                              <Text i>アップロードした時の日付</Text>
                            </div>
                            <div className='footer-icons'>
                              <Trash className='delete-icon' color='red' onClick={() => ("test")} />
                            </div>
                          </div>
                        </Card.Footer>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <></>  
              )}
            </Fieldset>
          </Fieldset.Group>
        </>
    </div>
  );
};
