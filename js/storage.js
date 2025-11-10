/**
 * 存储管理器类 - 任务1：本地保存功能
 * 负责文档的本地存储和管理
 */
class StorageManager {
  constructor() {
    // 存储键名
    this.STORAGE_KEY = 'text_processor_documents';
    this.CURRENT_DOC_KEY = 'text_processor_current_document';
    
    // 自动保存间隔（毫秒）
    this.AUTO_SAVE_INTERVAL = 30000;
    
    // 大文件阈值（字节）
    this.LARGE_FILE_THRESHOLD = 1024 * 1024; // 1MB
    
    // 自动保存定时器
    this.autoSaveTimer = null;
    
    // 当前文档ID
    this.currentDocumentId = null;
    
    // 初始化IndexedDB
    this.initIndexedDB();
  }
  
  /**
   * 初始化IndexedDB数据库
   */
  initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('TextProcessorDB', 1);
      
      request.onerror = () => {
        console.error('IndexedDB初始化失败');
        reject(new Error('IndexedDB初始化失败'));
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('IndexedDB初始化成功');
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // 创建文档存储对象
        if (!db.objectStoreNames.contains('documents')) {
          const store = db.createObjectStore('documents', { keyPath: 'id' });
          store.createIndex('fileName', 'fileName', { unique: false });
          store.createIndex('uploadTime', 'uploadTime', { unique: false });
          store.createIndex('lastEditTime', 'lastEditTime', { unique: false });
        }
      };
    });
  }
  
  /**
   * 生成唯一文档ID
   */
  generateDocumentId() {
    return 'doc_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  /**
   * 检查文件大小是否超过阈值
   */
  isLargeFile(content) {
    return new Blob([content]).size > this.LARGE_FILE_THRESHOLD;
  }
  
  /**
   * 保存文档到localStorage（小文件）
   */
  saveToLocalStorage(document) {
    try {
      const documents = this.getDocumentsFromLocalStorage();
      
      // 更新或添加文档
      const existingIndex = documents.findIndex(doc => doc.id === document.id);
      if (existingIndex !== -1) {
        documents[existingIndex] = document;
      } else {
        documents.push(document);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(documents));
      return true;
    } catch (error) {
      console.error('保存到localStorage失败:', error);
      return false;
    }
  }
  
  /**
   * 保存文档到IndexedDB（大文件）
   */
  saveToIndexedDB(document) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('IndexedDB未初始化'));
        return;
      }
      
      const transaction = this.db.transaction(['documents'], 'readwrite');
      const store = transaction.objectStore('documents');
      
      const request = store.put(document);
      
      request.onsuccess = () => {
        resolve(true);
      };
      
      request.onerror = () => {
        reject(new Error('保存到IndexedDB失败'));
      };
    });
  }
  
  /**
   * 从localStorage获取所有文档
   */
  getDocumentsFromLocalStorage() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('从localStorage获取文档失败:', error);
      return [];
    }
  }
  
  /**
   * 从IndexedDB获取所有文档
   */
  getDocumentsFromIndexedDB() {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        resolve([]);
        return;
      }
      
      const transaction = this.db.transaction(['documents'], 'readonly');
      const store = transaction.objectStore('documents');
      const request = store.getAll();
      
      request.onsuccess = () => {
        resolve(request.result || []);
      };
      
      request.onerror = () => {
        reject(new Error('从IndexedDB获取文档失败'));
      };
    });
  }
  
  /**
   * 保存文档
   */
  async saveDocument(documentData) {
    const document = {
      id: documentData.id || this.generateDocumentId(),
      fileName: documentData.fileName || '未命名文档',
      uploadTime: documentData.uploadTime || new Date().toISOString(),
      lastEditTime: new Date().toISOString(),
      chapters: documentData.chapters || [],
      content: documentData.content || '',
      storageType: this.isLargeFile(documentData.content) ? 'indexeddb' : 'localstorage'
    };
    
    try {
      if (document.storageType === 'localstorage') {
        const success = this.saveToLocalStorage(document);
        if (success) {
          this.currentDocumentId = document.id;
          localStorage.setItem(this.CURRENT_DOC_KEY, document.id);
          return { success: true, documentId: document.id };
        }
      } else {
        await this.saveToIndexedDB(document);
        this.currentDocumentId = document.id;
        localStorage.setItem(this.CURRENT_DOC_KEY, document.id);
        return { success: true, documentId: document.id };
      }
    } catch (error) {
      console.error('保存文档失败:', error);
      return { success: false, error: error.message };
    }
    
    return { success: false, error: '保存失败' };
  }
  
  /**
   * 获取文档
   */
  async getDocument(documentId) {
    try {
      // 先尝试从localStorage获取
      const localStorageDocs = this.getDocumentsFromLocalStorage();
      const localDoc = localStorageDocs.find(doc => doc.id === documentId);
      
      if (localDoc) {
        return localDoc;
      }
      
      // 如果localStorage没有，尝试从IndexedDB获取
      if (this.db) {
        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction(['documents'], 'readonly');
          const store = transaction.objectStore('documents');
          const request = store.get(documentId);
          
          request.onsuccess = () => {
            resolve(request.result || null);
          };
          
          request.onerror = () => {
            reject(new Error('获取文档失败'));
          };
        });
      }
    } catch (error) {
      console.error('获取文档失败:', error);
    }
    
    return null;
  }
  
  /**
   * 获取所有文档列表
   */
  async getAllDocuments() {
    try {
      const localStorageDocs = this.getDocumentsFromLocalStorage();
      const indexedDBDocs = await this.getDocumentsFromIndexedDB();
      
      // 合并文档列表，按最后编辑时间排序
      const allDocs = [...localStorageDocs, ...indexedDBDocs].sort((a, b) => 
        new Date(b.lastEditTime) - new Date(a.lastEditTime)
      );
      
      return allDocs;
    } catch (error) {
      console.error('获取所有文档失败:', error);
      return [];
    }
  }
  
  /**
   * 删除文档
   */
  async deleteDocument(documentId) {
    try {
      // 先尝试从localStorage删除
      const localStorageDocs = this.getDocumentsFromLocalStorage();
      const filteredDocs = localStorageDocs.filter(doc => doc.id !== documentId);
      
      if (filteredDocs.length !== localStorageDocs.length) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredDocs));
        return true;
      }
      
      // 如果localStorage没有，尝试从IndexedDB删除
      if (this.db) {
        return new Promise((resolve, reject) => {
          const transaction = this.db.transaction(['documents'], 'readwrite');
          const store = transaction.objectStore('documents');
          const request = store.delete(documentId);
          
          request.onsuccess = () => {
            resolve(true);
          };
          
          request.onerror = () => {
            reject(new Error('删除文档失败'));
          };
        });
      }
    } catch (error) {
      console.error('删除文档失败:', error);
    }
    
    return false;
  }
  
  /**
   * 开始自动保存
   */
  startAutoSave(getCurrentDataCallback) {
    this.stopAutoSave(); // 先停止之前的定时器
    
    this.autoSaveTimer = setInterval(async () => {
      const currentData = getCurrentDataCallback();
      if (currentData && currentData.content) {
        const result = await this.saveDocument(currentData);
        if (result.success) {
          console.log('自动保存成功');
        } else {
          console.warn('自动保存失败:', result.error);
        }
      }
    }, this.AUTO_SAVE_INTERVAL);
  }
  
  /**
   * 停止自动保存
   */
  stopAutoSave() {
    if (this.autoSaveTimer) {
      clearInterval(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }
  
  /**
   * 获取当前文档ID
   */
  getCurrentDocumentId() {
    if (!this.currentDocumentId) {
      this.currentDocumentId = localStorage.getItem(this.CURRENT_DOC_KEY);
    }
    return this.currentDocumentId;
  }
  
  /**
   * 设置当前文档ID
   */
  setCurrentDocumentId(documentId) {
    this.currentDocumentId = documentId;
    localStorage.setItem(this.CURRENT_DOC_KEY, documentId);
  }
}

// 导出模块
window.StorageManager = StorageManager;