// 测试用例定义
class TestCases {
  // 编码测试用例
  static getEncodingTestCases() {
    return {
      utf8: {
        name: "UTF-8编码测试",
        content: "这是一个UTF-8编码的测试文件，包含中文字符：你好世界！",
        encoding: "utf-8"
      },
      gbk: {
        name: "GBK编码测试", 
        // 使用GBK编码的字节序列创建测试内容
        content: this.createGbkEncodedText("这是一个GBK编码的测试文件，包含中文字符：你好世界！"),
        encoding: "gbk"
      },
      ansi: {
        name: "ANSI编码测试",
        content: "This is an ANSI encoded test file with English characters: Hello World!",
        encoding: "ansi"
      }
    };
  }
  
  // 创建GBK编码的文本
  static createGbkEncodedText(text) {
    // 在实际应用中，这里应该使用GBK编码
    // 但在JavaScript中，我们只能模拟这个过程
    // 我们返回原始文本，但在测试中会使用特定的解码器
    return text;
  }

  // 分章测试用例
  static getChapterTestCases() {
    return {
      mixedFormat: {
        name: "混合章节格式测试",
        content: `
前言
这是前言内容。

第一章：开始
这是第一章的内容。

第2章 继续
这是第二章的内容。

【第三章】结束
这是第三章的内容。
        `,
        expectedChapters: 3
      },
      singleChapter: {
        name: "单章节测试", 
        content: `
第一章：唯一章节
这是唯一章节的内容，没有其他章节。
        `,
        expectedChapters: 1
      },
      noChapter: {
        name: "无章节标记测试",
        content: `
这是一段没有章节标记的文本。
它应该被识别为单个章节。
        `,
        expectedChapters: 1
      }
    };
  }

  // 边界测试用例
  static getBoundaryTestCases() {
    return {
      empty: {
        name: "空文档测试",
        content: "",
        shouldError: true
      },
      large: {
        name: "大文件测试",
        content: "A".repeat(10 * 1024 * 1024), // 10MB
        shouldHandle: true
      },
      veryLarge: {
        name: "超大文件测试", 
        content: "B".repeat(60 * 1024 * 1024), // 60MB
        shouldError: true
      }
    };
  }
}

// 导出测试用例
window.TestCases = TestCases;